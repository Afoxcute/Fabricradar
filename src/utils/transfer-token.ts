import { PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import {
  Rpc,
  createRpc,
  bn,
  dedupeSigner,
  sendAndConfirmTx,
  buildAndSignTx
} from "@lightprotocol/stateless.js";
import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer
} from "@lightprotocol/compressed-token";

/**
 * Transfers compressed tokens to a recipient address
 * 
 * @param mint - The mint address of the token
 * @param publicKey - The sender's public key
 * @param recipientAddress - The recipient's public key
 * @param amount - The amount to transfer
 * @param rpcEndpoint - The RPC endpoint to use
 * @returns The Transaction object to be signed
 */
export const transferCompressedTokens = async (
  mint: PublicKey,
  senderPublicKey: PublicKey,
  recipientAddress: PublicKey,
  amount: number = 1e5,
  rpcEndpoint: string
): Promise<Transaction> => {
  try {
    console.log("=== Starting Compressed Token Transfer ===");
    console.log(`Sender: ${senderPublicKey.toString()}`);
    console.log(`Recipient: ${recipientAddress.toString()}`);
    console.log(`Mint: ${mint.toString()}`);
    console.log(`Amount: ${amount}`);
    console.log(`RPC Endpoint: ${rpcEndpoint}`);

    // Create RPC connection using the stateless.js API
    const rpc = createRpc(
      rpcEndpoint,
      rpcEndpoint,
      rpcEndpoint
    );
    console.log("Created RPC connection");

    // Convert amount to BN type as required by the API
    const amountBn = bn(amount);
    console.log("Converted amount to BN:", amountBn.toString());

    // Get compressed token accounts for this mint that belong to the sender
    console.log("Fetching compressed token accounts for sender...");
    const parsedAccounts = await rpc.getCompressedTokenAccountsByOwner(
      senderPublicKey,
      { mint }
    );
    console.log("Compressed token accounts found:", parsedAccounts.items.length);

    // Validate that we have accounts to transfer from
    if (!parsedAccounts.items.length) {
      console.error("No compressed token accounts found for this mint");
      throw new Error("No compressed token accounts found for this mint.");
    }
    console.log(`Found ${parsedAccounts.items.length} compressed token accounts`);

    // Select accounts with sufficient balance for the transfer
    console.log("Selecting accounts for transfer...");
    const [inputAccounts, _] = selectMinCompressedTokenAccountsForTransfer(
      parsedAccounts.items, 
      amountBn
    );
    console.log("Selected accounts count:", inputAccounts.length);

    if (!inputAccounts.length) {
      console.error("Insufficient token balance for transfer");
      throw new Error("Insufficient token balance for transfer.");
    }

    // Log account details for debugging
    inputAccounts.forEach((account, idx) => {
      // Clone the object to avoid circular references
      const accountCopy = { ...account.compressedAccount };
      console.log(`Account ${idx} structure:`, Object.keys(accountCopy));
      console.log(`Account ${idx} hash:`, accountCopy.hash.toString());
    });
    
    // Fetch validity proof for the selected accounts
    console.log("Fetching validity proof with getValidityProofV0...");
    
    try {
      // Try to use getValidityProofV0, but we need to understand the exact expected structure
      // Inspect the first account to understand available fields
      const firstAccount = inputAccounts[0].compressedAccount;
      console.log("First account properties:", Object.keys(firstAccount));
      
      // Build the hashesWithTree array based on available properties
      const hashesWithTree = inputAccounts.map(account => {
        const compressedAccount = account.compressedAccount;
        
        // Create an object with the required hash - we can debug by logging available properties
        const result: any = {
          hash: compressedAccount.hash
        };
        
        // Only add tree and queue if they exist
        if ('tree' in compressedAccount) {
          result.tree = compressedAccount.tree;
        }
        
        if ('merkleTree' in compressedAccount) {
          result.tree = compressedAccount.merkleTree;
        }
        
        if ('queue' in compressedAccount) {
          result.queue = compressedAccount.queue;
        }
        
        // Default values if properties don't exist
        if (!('tree' in result)) {
          result.tree = null;
        }
        
        if (!('queue' in result)) {
          result.queue = null;
        }
        
        return result;
      });
      
      console.log("HashesWithTree keys:", hashesWithTree.map(h => Object.keys(h)));
      
      // Use getValidityProofV0 with the constructed objects
      const { compressedProof, rootIndices } = await rpc.getValidityProofV0(
        hashesWithTree,
        undefined
      );
      
      console.log("Got validity proof from getValidityProofV0");
      console.log("Root indices count:", rootIndices.length);
      
      // Create transfer instruction
      console.log("Creating transfer instruction...");
      const transferIx = await CompressedTokenProgram.transfer({
        payer: senderPublicKey,
        inputCompressedTokenAccounts: inputAccounts,
        toAddress: recipientAddress,
        amount: amountBn,
        recentInputStateRootIndices: rootIndices,
        recentValidityProof: compressedProof
      });
      console.log("Created transfer instruction");

      // Build the transaction
      console.log("Building transaction...");
      
      // Add compute budget instruction to increase compute units if necessary
      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1_000_000
      });
      
      // Create a new transaction and add the compute budget instruction and transfer instruction
      const transaction = new Transaction();
      transaction.add(modifyComputeUnits);
      transaction.add(transferIx);
      transaction.feePayer = senderPublicKey;
      transaction.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
      
      console.log("Transaction built successfully");
      console.log("Transaction details:", {
        instructions: transaction.instructions.length,
        feePayer: transaction.feePayer.toString(),
        recentBlockhash: transaction.recentBlockhash
      });
      
      // Return the transaction for signing with the wallet adapter
      return transaction;
    } catch (error) {
      console.error("Error with getValidityProofV0:", error);
      
      // Fallback to the older getValidityProof method if the V0 version fails
      console.log("Falling back to getValidityProof...");
      const hashes = inputAccounts.map(account => account.compressedAccount.hash);
      const proof = await rpc.getValidityProof(hashes);
      
      console.log("Got validity proof from fallback method");
      
      // Create transfer instruction
      console.log("Creating transfer instruction (fallback)...");
      const transferIx = await CompressedTokenProgram.transfer({
        payer: senderPublicKey,
        inputCompressedTokenAccounts: inputAccounts,
        toAddress: recipientAddress,
        amount: amountBn,
        recentInputStateRootIndices: proof.rootIndices,
        recentValidityProof: proof.compressedProof
      });
      console.log("Created transfer instruction");

      // Build the transaction
      console.log("Building transaction...");
      
      // Add compute budget instruction to increase compute units if necessary
      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1_000_000
      });
      
      // Create a new transaction and add the compute budget instruction and transfer instruction
      const transaction = new Transaction();
      transaction.add(modifyComputeUnits);
      transaction.add(transferIx);
      transaction.feePayer = senderPublicKey;
      transaction.recentBlockhash = (await rpc.getRecentBlockhash()).blockhash;
      
      console.log("Transaction built successfully (fallback)");
      console.log("Transaction details:", {
        instructions: transaction.instructions.length,
        feePayer: transaction.feePayer.toString(),
        recentBlockhash: transaction.recentBlockhash
      });
      
      // Return the transaction for signing with the wallet adapter
      return transaction;
    }
  } catch (error) {
    console.error("Token transfer error:", error);
    throw error;
  }
}; 