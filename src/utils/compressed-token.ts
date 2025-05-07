import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  createMintToInstruction,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

// The mint address for the compressed token
export const CTOKEN_MINT_ADDRESS = 'cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m';

/**
 * Creates a Solana RPC connection
 * @returns Connection
 */
export function createConnection(): Connection {
  // Use the RPC endpoint from the environment variable
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";
  // Create a standard web3.js Connection
  return new Connection(rpcEndpoint);
}

/**
 * Mint tokens to a tailor's wallet
 * 
 * @param recipientPublicKey - The public key of the tailor to receive tokens
 * @param amount - The amount of tokens to mint (will be multiplied by decimal factor)
 * @param sendTransaction - Function to sign and send transactions from wallet provider
 * @returns Transaction signature
 */
export async function mintCompressedTokens(
  recipientPublicKey: PublicKey,
  amount: number,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: any
  ) => Promise<string>
): Promise<string> {
  try {
    // Create connection
    const connection = createConnection();
    
    // Parse mint address
    const mintPubkey = new PublicKey(CTOKEN_MINT_ADDRESS);

    // Get or create token account for recipient
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      // We need a real payer for this function, but since we're using the wallet adapter,
      // we'll use a hack by passing the recipient as the payer - this won't actually be used
      // since the transaction will be sent via the wallet adapter
      { publicKey: recipientPublicKey } as any,
      mintPubkey,
      recipientPublicKey
    );

    // Create transaction
    const transaction = new Transaction();
    
    // Add instruction to mint tokens to the account
    // Note: This will only work if the connected wallet is a mint authority
    transaction.add(
      createMintToInstruction(
        mintPubkey,                 // mint
        tokenAccount.address,       // destination
        recipientPublicKey,         // authority (must be an authority on the mint)
        amount * 1e9,               // amount with decimals
        [],                         // no additional signers
        TOKEN_PROGRAM_ID            // program ID
      )
    );
    
    // Sign and send the transaction using the wallet's sendTransaction method
    const signature = await sendTransaction(transaction, connection);
    
    return signature;
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
}

/**
 * Get the balance of tokens for a wallet
 * 
 * @param walletPublicKey - The public key of the wallet
 * @returns The token balance
 */
export async function getCompressedTokenBalance(walletPublicKey: PublicKey): Promise<number> {
  try {
    const connection = createConnection();
    const mintPubkey = new PublicKey(CTOKEN_MINT_ADDRESS);
    
    // Get token account address
    const tokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      walletPublicKey
    );
    
    try {
      // Try to get token account info
      const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
      return Number(tokenAccountInfo.value.uiAmount || 0);
    } catch (error) {
      // Token account might not exist yet
      return 0;
    }
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
} 