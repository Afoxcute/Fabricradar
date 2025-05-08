import { useState } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { useConnection } from '@solana/wallet-adapter-react';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { PublicKey, Keypair, SystemProgram, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { 
  createRpc, 
  buildAndSignTx, 
  sendAndConfirmTx, 
  selectStateTreeInfo 
} from '@lightprotocol/stateless.js';
import { 
  createTokenPool, 
  compress, 
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectTokenPoolInfo
} from '@lightprotocol/compressed-token';
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { useSolanaWallets } from '@privy-io/react-auth/solana';

type TokenMetadataInput = {
  name: string;
  symbol: string;
  uri?: string;
  additionalMetadata?: [string, string][];
};

type TokenMintOptions = {
  decimals?: number;
  initialSupply?: number;
  metadata: TokenMetadataInput;
  onProgress?: (stage: string) => void;
};

type MintResult = {
  mintAddress: string;
  txId: string;
};

export function useTokenMinter() {
  const wallet = useWallet();
  const { wallets, ready: walletsReady } = useSolanaWallets();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintToken2022 = async (options: TokenMintOptions): Promise<MintResult | null> => {
    if (!wallet.publicKey || !wallet.connected) {
      setError('Wallet not connected');
      return null;
    }
    
    // Get the actual Privy wallet
    const privyWallet = wallets && wallets.length > 0 ? wallets[0] : null;
    
    if (!privyWallet) {
      setError('No Privy wallet available');
      return null;
    }

    // Helper function to update progress
    const updateProgress = (stage: string) => {
      if (options.onProgress) {
        options.onProgress(stage);
      }
    };

    try {
      setIsLoading(true);
      setError(null);
      updateProgress('Preparing transaction...');

      // Use environment variable for RPC endpoint or fallback to the connected endpoint
      const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || connection.rpcEndpoint;
      
      // Create RPC connection for Light Protocol
      const rpc = createRpc(RPC_ENDPOINT);

      // Generate a new keypair for the mint
      const mint = Keypair.generate();

      // Default values
      const decimals = options.decimals ?? 9;
      const initialSupply = options.initialSupply ?? 1_000_000_000;
      
      // Create metadata for the token
      const metadata: TokenMetadata = {
        mint: mint.publicKey,
        name: options.metadata.name,
        symbol: options.metadata.symbol,
        uri: options.metadata.uri || "",
        additionalMetadata: [
          ["created_by", wallet.publicKey.toString()],
          ...(options.metadata.additionalMetadata || [])
        ],
      };

      updateProgress('Creating TOKEN-2022 mint...');

      // Calculate space needed for mint with metadata pointer extension
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      // Get minimum lamports for rent exemption
      const mintLamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );
 
      // First get a recent blockhash
      updateProgress('Getting recent blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

      // Create a transaction for initializing the mint and metadata
      updateProgress('Building mint transaction...');
      const mintTransaction = new Transaction({
        feePayer: wallet.publicKey,
        blockhash,
        lastValidBlockHeight
      }).add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mint.publicKey,
          space: mintLen,
          lamports: mintLamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mint.publicKey,
          wallet.publicKey,
          mint.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mint.publicKey,
          decimals,
          wallet.publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mint.publicKey,
          metadata: mint.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );

      // Sign and send the transaction - Use Privy's direct wallet hook for proper signing
      updateProgress('Requesting transaction signature...');
      console.log("Requesting signature for mint transaction with blockhash:", blockhash);
      
      // Let the mint keypair sign first
      mintTransaction.partialSign(mint);
      
      // Use the Privy wallet to sign 
      const signedTransaction = await privyWallet.signTransaction(mintTransaction);
      
      updateProgress('Sending transaction...');
      console.log("Transaction signed, now sending to network");
      
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log("Mint transaction sent, waiting for confirmation...");
      // Use a more direct confirmation strategy with a shorter timeout
      updateProgress('Confirming transaction...');
      const confirmation = await connection.confirmTransaction({
        signature: txId,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }
      
      console.log("Mint transaction confirmed:", txId);

      // Register the mint with the Compressed-Token program
      updateProgress('Creating token pool...');
      console.log("Creating token pool for TOKEN-2022 mint");
      try {
        const tokenPoolTxId = await createTokenPool(
          rpc,
          {
            publicKey: wallet.publicKey,
            signTransaction: async (tx: any) => {
              return await privyWallet.signTransaction(tx);
            }
          } as any,
          mint.publicKey,
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        console.log("Token pool created with txId:", tokenPoolTxId);
      } catch (error) {
        console.error("Error creating token pool:", error);
        throw new Error(`Token pool creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Create an Associated Token Account for the wallet
      updateProgress('Creating token account...');
      console.log("Creating associated token account...");
      let ata;
      try {
        ata = await getOrCreateAssociatedTokenAccount(
          connection,
          {
            publicKey: wallet.publicKey,
            signTransaction: async (tx: any) => {
              return await privyWallet.signTransaction(tx);
            }
          } as any,
          mint.publicKey,
          wallet.publicKey,
          undefined,
          undefined,
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        console.log("Associated token account created:", ata.address.toString());
      } catch (error) {
        console.error("Error creating associated token account:", error);
        throw new Error(`Associated token account creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Calculate mint amount based on supply and decimals
      const mintAmount = initialSupply * Math.pow(10, decimals);
      updateProgress(`Minting ${initialSupply} tokens...`);
      console.log(`Minting ${initialSupply} tokens (${mintAmount} raw amount)...`);

      // Mint tokens to the wallet's token account
      try {
        const mintToTxId = await mintTo(
          connection,
          {
            publicKey: wallet.publicKey,
            signTransaction: async (tx: any) => {
              return await privyWallet.signTransaction(tx);
            }
          } as any,
          mint.publicKey,
          ata.address,
          wallet.publicKey,
          mintAmount,
          undefined,
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        
        // Wait for confirmation
        updateProgress('Confirming mint transaction...');
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        const confirmation = await connection.confirmTransaction({
          signature: mintToTxId,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed');
        
        if (confirmation.value.err) {
          throw new Error(`Mint transaction failed: ${confirmation.value.err.toString()}`);
        }
        
        console.log("Tokens minted successfully with txId:", mintToTxId);
      } catch (error) {
        console.error("Error minting tokens:", error);
        throw new Error(`Token minting failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Compress tokens using improved method
      updateProgress('Compressing tokens...');
      console.log("Compressing tokens...");
      try {
        // 1. Fetch & Select state tree infos
        const treeInfos = await rpc.getStateTreeInfos();
        if (!treeInfos || treeInfos.length === 0) {
          throw new Error("No state tree infos found");
        }
        const treeInfo = selectStateTreeInfo(treeInfos);

        // 2. Fetch & Select token pool info
        const tokenPoolInfos = await getTokenPoolInfos(rpc, mint.publicKey);
        if (!tokenPoolInfos || tokenPoolInfos.length === 0) {
          throw new Error("No token pool infos found for this mint");
        }
        const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);

        // 3. Build compress instruction
        const compressInstruction = await CompressedTokenProgram.compress({
          payer: wallet.publicKey,
          owner: wallet.publicKey,
          source: ata.address,
          toAddress: wallet.publicKey, // to self
          amount: mintAmount,
          mint: mint.publicKey,
          outputStateTreeInfo: treeInfo,
          tokenPoolInfo,
        });

        // 4. Build and sign transaction
        const latestBlockhash = await rpc.getLatestBlockhash();
        
        // Create a signer that uses Privy wallet
        const signer = {
          publicKey: wallet.publicKey,
          signTransaction: async (tx: any) => {
            return await privyWallet.signTransaction(tx);
          }
        };

        const tx = await buildAndSignTx(
          [
            ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
            compressInstruction,
          ],
          signer as any,
          latestBlockhash.blockhash,
          [signer as any]
        );

        // 5. Send and confirm transaction
        const compressedTokenTxId = await sendAndConfirmTx(rpc, tx);
        console.log("Tokens compressed successfully with txId:", compressedTokenTxId);
        updateProgress('Tokens minted and compressed successfully!');
        
        return {
          mintAddress: mint.publicKey.toString(),
          txId: compressedTokenTxId,
        };
      } catch (error) {
        console.error("Error compressing tokens:", error);
        setError(`Compression failed: ${error instanceof Error ? error.message : String(error)}`);
        // Even if compression fails, we've still created the token
        return {
          mintAddress: mint.publicKey.toString(),
          txId: "compression-failed", // Indicate that compression failed but token was created
        };
      }
    } catch (err) {
      console.error('Error minting token:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint token');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mintToken2022,
    isLoading,
    error,
  };
} 