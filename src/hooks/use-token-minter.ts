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
    
    // Extensive debugging for wallet
    console.log("DEBUG: Wallet status", {
      connected: wallet.connected,
      pubkey: wallet.publicKey.toString(),
    });
    
    // Get the actual Privy wallet
    const privyWallet = wallets && wallets.length > 0 ? wallets[0] : null;
    
    // Debug privyWallet
    console.log("DEBUG: Privy wallet", {
      available: !!privyWallet,
      address: privyWallet ? privyWallet.address : 'none',
      type: privyWallet ? privyWallet.walletClientType : 'none'
    });
    
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
      console.log("DEBUG: Using RPC endpoint:", RPC_ENDPOINT);
      
      // Create RPC connection for Light Protocol
      const rpc = createRpc(RPC_ENDPOINT);
      console.log("DEBUG: RPC connection created");

      // Generate a new keypair for the mint
      const mint = Keypair.generate();
      console.log("DEBUG: Generated mint keypair", {
        publicKey: mint.publicKey.toString(),
      });

      // Default values
      const decimals = options.decimals ?? 9;
      const initialSupply = options.initialSupply ?? 1_000_000_000;
      console.log("DEBUG: Token parameters", {
        decimals,
        initialSupply,
        name: options.metadata.name,
        symbol: options.metadata.symbol,
      });
      
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
      console.log("DEBUG: Metadata created", metadata);

      updateProgress('Creating TOKEN-2022 mint...');

      // Calculate space needed for mint with metadata pointer extension
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
      console.log("DEBUG: Mint length calculations", {
        mintLen,
        metadataLen,
        TYPE_SIZE,
        LENGTH_SIZE,
        packedMetadataLength: pack(metadata).length
      });

      // Get minimum lamports for rent exemption
      const mintLamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );
      console.log("DEBUG: Mint lamports required", mintLamports);
 
      // First get a recent blockhash
      updateProgress('Getting recent blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      console.log("DEBUG: Got blockhash", {
        blockhash,
        lastValidBlockHeight
      });

      // Create a transaction for initializing the mint and metadata
      updateProgress('Building mint transaction...');
      console.log("DEBUG: Building token initialization transaction");
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
      console.log("DEBUG: Transaction built with instructions count:", mintTransaction.instructions.length);

      // Sign and send the transaction - Use Privy's direct wallet hook for proper signing
      updateProgress('Requesting transaction signature...');
      console.log("DEBUG: Requesting signature for mint transaction with blockhash:", blockhash);
      
      // Let the mint keypair sign first
      mintTransaction.partialSign(mint);
      console.log("DEBUG: Transaction partially signed by mint keypair");
      
      // Use the Privy wallet to sign 
      const signedTransaction = await privyWallet.signTransaction(mintTransaction);
      console.log("DEBUG: Transaction signed by wallet");
      
      updateProgress('Sending transaction...');
      console.log("DEBUG: Transaction signed, now sending to network");
      
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      console.log("DEBUG: Transaction sent with ID:", txId);
      
      console.log("DEBUG: Mint transaction sent, waiting for confirmation...");
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
      
      console.log("DEBUG: Mint transaction confirmed:", txId);

      // Register the mint with the Compressed-Token program
      updateProgress('Creating token pool...');
      console.log("DEBUG: Creating token pool for TOKEN-2022 mint, parameters:", {
        mint: mint.publicKey.toString(),
        programId: TOKEN_2022_PROGRAM_ID.toString()
      });
      
      try {
        console.log("DEBUG: Creating token pool, checking rpc object:", {
          rpcExists: !!rpc,
          hasGetStateTreeInfos: !!(rpc && rpc.getStateTreeInfos),
          connectionType: typeof connection,
        });
        
        console.log("DEBUG: Creating signer object for createTokenPool");
        const signer = {
          publicKey: wallet.publicKey,
          signTransaction: async (tx: any) => {
            console.log("DEBUG: Inside signTransaction for token pool creation");
            try {
              const signedTx = await privyWallet.signTransaction(tx);
              console.log("DEBUG: Transaction signed successfully for token pool");
              return signedTx;
            } catch (err) {
              console.error("DEBUG: Error signing transaction for token pool:", err);
              throw err;
            }
          }
        };
        console.log("DEBUG: Signer object created");
        
        console.log("DEBUG: Calling createTokenPool with parameters", {
          mintAddress: mint.publicKey.toString(),
          programId: TOKEN_2022_PROGRAM_ID.toString()
        });
        
        const tokenPoolTxId = await createTokenPool(
          rpc,
          signer as any,
          mint.publicKey,
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        console.log("DEBUG: Token pool created with txId:", tokenPoolTxId);
      } catch (error) {
        console.error("DEBUG: Error creating token pool - FULL ERROR OBJECT:", error);
        console.error("DEBUG: Error stack trace:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("DEBUG: Error stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        throw new Error(`Token pool creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Create an Associated Token Account for the wallet
      updateProgress('Creating token account...');
      console.log("DEBUG: Creating associated token account...");
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
        console.log("DEBUG: Associated token account created:", ata.address.toString());
      } catch (error) {
        console.error("DEBUG: Error creating associated token account:", error);
        throw new Error(`Associated token account creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Calculate mint amount based on supply and decimals
      const mintAmount = initialSupply * Math.pow(10, decimals);
      updateProgress(`Minting ${initialSupply} tokens...`);
      console.log(`DEBUG: Minting ${initialSupply} tokens (${mintAmount} raw amount)...`);

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
        
        console.log("DEBUG: MintTo transaction ID:", mintToTxId);
        
        // Wait for confirmation
        updateProgress('Confirming mint transaction...');
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        console.log("DEBUG: Got blockhash for confirming mintTo:", blockhash);
        
        const confirmation = await connection.confirmTransaction({
          signature: mintToTxId,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed');
        
        if (confirmation.value.err) {
          throw new Error(`Mint transaction failed: ${confirmation.value.err.toString()}`);
        }
        
        console.log("DEBUG: Tokens minted successfully with txId:", mintToTxId);
      } catch (error) {
        console.error("DEBUG: Error minting tokens:", error);
        throw new Error(`Token minting failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Compress tokens using improved method
      updateProgress('Compressing tokens...');
      console.log("DEBUG: Starting token compression process");
      try {
        // 1. Fetch & Select state tree infos
        console.log("DEBUG: Fetching state tree infos");
        const treeInfos = await rpc.getStateTreeInfos();
        console.log("DEBUG: State tree infos fetched", {
          count: treeInfos ? treeInfos.length : 0,
          treeInfos: treeInfos ? JSON.stringify(treeInfos.slice(0, 1)) : 'none' // Only log first item to avoid huge logs
        });
        
        if (!treeInfos || treeInfos.length === 0) {
          throw new Error("No state tree infos found");
        }
        
        console.log("DEBUG: Selecting state tree info");
        const treeInfo = selectStateTreeInfo(treeInfos);
        console.log("DEBUG: Selected state tree info:", typeof treeInfo, Object.keys(treeInfo));
        
        // Log all properties of treeInfo for debugging
        for (const key of Object.keys(treeInfo)) {
          console.log(`DEBUG: treeInfo[${key}] =`, (treeInfo as any)[key]);
        }

        // 2. Fetch & Select token pool info
        console.log("DEBUG: Fetching token pool infos for mint", mint.publicKey.toString());
        const tokenPoolInfos = await getTokenPoolInfos(rpc, mint.publicKey);
        console.log("DEBUG: Token pool infos fetched", {
          count: tokenPoolInfos ? tokenPoolInfos.length : 0,
          tokenPoolInfos: tokenPoolInfos ? JSON.stringify(tokenPoolInfos.slice(0, 1)) : 'none' // Only log first item
        });
        
        if (!tokenPoolInfos || tokenPoolInfos.length === 0) {
          throw new Error("No token pool infos found for this mint");
        }
        
        console.log("DEBUG: Selecting token pool info");
        const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);
        console.log("DEBUG: Selected token pool info:", typeof tokenPoolInfo, Object.keys(tokenPoolInfo));
        
        // Log all properties of tokenPoolInfo for debugging
        for (const key of Object.keys(tokenPoolInfo)) {
          console.log(`DEBUG: tokenPoolInfo[${key}] =`, (tokenPoolInfo as any)[key]);
        }

        // 3. Build compress instruction
        console.log("DEBUG: Building compress instruction with params:", {
          payer: wallet.publicKey.toString(),
          owner: wallet.publicKey.toString(),
          source: ata.address.toString(),
          toAddress: wallet.publicKey.toString(),
          amount: mintAmount.toString(),
          mint: mint.publicKey.toString(),
          // Skip outputStateTreeInfo and tokenPoolInfo as they're complex objects
        });
        
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
        console.log("DEBUG: Compress instruction built successfully");

        // 4. Build and sign transaction
        console.log("DEBUG: Getting latest blockhash for compression tx");
        const latestBlockhash = await rpc.getLatestBlockhash();
        console.log("DEBUG: Got blockhash for compression:", latestBlockhash.blockhash);
        
        // Create a signer that uses Privy wallet
        console.log("DEBUG: Creating signer for compression tx");
        const signer = {
          publicKey: wallet.publicKey,
          signTransaction: async (tx: any) => {
            console.log("DEBUG: Signing compression transaction");
            return await privyWallet.signTransaction(tx);
          }
        };

        console.log("DEBUG: Building and signing compression transaction");
        const tx = await buildAndSignTx(
          [
            ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
            compressInstruction,
          ],
          signer as any,
          latestBlockhash.blockhash,
          [signer as any]
        );
        console.log("DEBUG: Compression transaction built and signed");

        // 5. Send and confirm transaction
        console.log("DEBUG: Sending compression transaction");
        const compressedTokenTxId = await sendAndConfirmTx(rpc, tx);
        console.log("DEBUG: Tokens compressed successfully with txId:", compressedTokenTxId);
        updateProgress('Tokens minted and compressed successfully!');
        
        return {
          mintAddress: mint.publicKey.toString(),
          txId: compressedTokenTxId,
        };
      } catch (error) {
        console.error("DEBUG: Error compressing tokens - FULL ERROR:", error);
        console.error("DEBUG: Error stack trace:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("DEBUG: Error stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        setError(`Compression failed: ${error instanceof Error ? error.message : String(error)}`);
        // Even if compression fails, we've still created the token
        return {
          mintAddress: mint.publicKey.toString(),
          txId: "compression-failed", // Indicate that compression failed but token was created
        };
      }
    } catch (err) {
      console.error('DEBUG: Error minting token - FULL ERROR:', err);
      console.error("DEBUG: Error stack trace:", err instanceof Error ? err.stack : 'No stack trace');
      console.error("DEBUG: Error stringified:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
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