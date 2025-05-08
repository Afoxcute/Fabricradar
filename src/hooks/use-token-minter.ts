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
      console.error('Wallet not connected');
      setError('Wallet not connected');
      return null;
    }
    
    // Get the actual Privy wallet
    const privyWallet = wallets && wallets.length > 0 ? wallets[0] : null;
    console.log('DEBUG: Found wallet?', Boolean(privyWallet), 'Wallet address:', wallet.publicKey.toString());
    
    if (!privyWallet) {
      console.error('No Privy wallet available');
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
      console.log('DEBUG: Using RPC endpoint:', RPC_ENDPOINT);
      
      // Create RPC connection for Light Protocol
      const rpc = createRpc(RPC_ENDPOINT);
      console.log('DEBUG: RPC connection created successfully');

      // Generate a new keypair for the mint
      const mint = Keypair.generate();
      console.log('DEBUG: Generated mint keypair:', mint.publicKey.toString());

      // Default values
      const decimals = options.decimals ?? 9;
      const initialSupply = options.initialSupply ?? 1_000_000_000;
      console.log('DEBUG: Using decimals:', decimals, 'initialSupply:', initialSupply);
      
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
      console.log('DEBUG: Token metadata created:', JSON.stringify({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri
      }));

      updateProgress('Creating TOKEN-2022 mint...');

      // Calculate space needed for mint with metadata pointer extension
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
      console.log('DEBUG: Mint length:', mintLen, 'Metadata length:', metadataLen);

      // Get minimum lamports for rent exemption
      const mintLamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );
      console.log('DEBUG: Mint lamports required:', mintLamports);
 
      // First get a recent blockhash
      updateProgress('Getting recent blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      console.log('DEBUG: Got blockhash:', blockhash, 'Last valid block height:', lastValidBlockHeight);

      // Create a transaction for initializing the mint and metadata
      updateProgress('Building mint transaction...');
      console.log('DEBUG: Building mint transaction - creating instructions');
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
      console.log('DEBUG: Mint transaction built with', mintTransaction.instructions.length, 'instructions');

      // Sign and send the transaction - Use Privy's direct wallet hook for proper signing
      updateProgress('Requesting transaction signature...');
      console.log("DEBUG: Requesting signature for mint transaction with blockhash:", blockhash);
      
      // Let the mint keypair sign first
      mintTransaction.partialSign(mint);
      console.log('DEBUG: Transaction partially signed by mint keypair');
      
      // Use the Privy wallet to sign 
      const signedTransaction = await privyWallet.signTransaction(mintTransaction);
      console.log('DEBUG: Transaction fully signed by Privy wallet');
      
      updateProgress('Sending transaction...');
      console.log("DEBUG: Transaction signed, now sending to network");
      
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      console.log("DEBUG: Raw transaction sent, txId:", txId);
      
      console.log("DEBUG: Mint transaction sent, waiting for confirmation...");
      // Use a more direct confirmation strategy with a shorter timeout
      updateProgress('Confirming transaction...');
      const confirmation = await connection.confirmTransaction({
        signature: txId,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');
      
      if (confirmation.value.err) {
        const errMsg = `Transaction failed: ${confirmation.value.err.toString()}`;
        console.error("DEBUG:", errMsg);
        throw new Error(errMsg);
      }
      
      console.log("DEBUG: Mint transaction confirmed:", txId);

      // Register the mint with the Compressed-Token program
      updateProgress('Creating token pool...');
      console.log("DEBUG: Creating token pool for TOKEN-2022 mint");
      try {
        console.log("DEBUG: Calling createTokenPool with params:", {
          rpc: "RPC_INSTANCE",
          signer: wallet.publicKey.toString(),
          mint: mint.publicKey.toString(),
          programId: TOKEN_2022_PROGRAM_ID.toString()
        });
        
        // Trace the token pool creation
        console.log("DEBUG: Starting token pool creation");
        console.trace("Token pool creation call stack");
        
        const tokenPoolTxId = await createTokenPool(
          rpc,
          {
            publicKey: wallet.publicKey,
            signTransaction: async (tx: any) => {
              console.log("DEBUG: Inside signTransaction callback for token pool");
              return await privyWallet.signTransaction(tx);
            }
          } as any,
          mint.publicKey,
          undefined,
          TOKEN_2022_PROGRAM_ID
        );
        console.log("DEBUG: Token pool created with txId:", tokenPoolTxId);
      } catch (error) {
        console.error("DEBUG: Error creating token pool:", error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error("DEBUG: Error name:", error.name);
          console.error("DEBUG: Error message:", error.message);
          console.error("DEBUG: Error stack:", error.stack);
        } else {
          console.error("DEBUG: Non-Error object thrown:", error);
        }
        throw new Error(`Token pool creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Create an Associated Token Account for the wallet
      updateProgress('Creating token account...');
      console.log("DEBUG: Creating associated token account...");
      let ata;
      try {
        console.log("DEBUG: Calling getOrCreateAssociatedTokenAccount with mint:", mint.publicKey.toString());
        ata = await getOrCreateAssociatedTokenAccount(
          connection,
          {
            publicKey: wallet.publicKey,
            signTransaction: async (tx: any) => {
              console.log("DEBUG: Inside signTransaction callback for ATA");
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
        if (error instanceof Error) {
          console.error("DEBUG: Error stack:", error.stack);
        }
        throw new Error(`Associated token account creation failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Calculate mint amount based on supply and decimals
      const mintAmount = initialSupply * Math.pow(10, decimals);
      updateProgress(`Minting ${initialSupply} tokens...`);
      console.log(`DEBUG: Minting ${initialSupply} tokens (${mintAmount} raw amount)...`);

      // Mint tokens to the wallet's token account
      try {
        console.log("DEBUG: Calling mintTo with address:", ata.address.toString());
        const mintToTxId = await mintTo(
          connection,
          {
            publicKey: wallet.publicKey,
            signTransaction: async (tx: any) => {
              console.log("DEBUG: Inside signTransaction callback for mintTo");
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
        console.log("DEBUG: mintTo transaction sent, txId:", mintToTxId);
        
        // Wait for confirmation
        updateProgress('Confirming mint transaction...');
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        console.log("DEBUG: Got new blockhash for mintTo confirmation:", blockhash);
        
        const confirmation = await connection.confirmTransaction({
          signature: mintToTxId,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed');
        
        if (confirmation.value.err) {
          const errMsg = `Mint transaction failed: ${confirmation.value.err.toString()}`;
          console.error("DEBUG:", errMsg);
          throw new Error(errMsg);
        }
        
        console.log("DEBUG: Tokens minted successfully with txId:", mintToTxId);
      } catch (error) {
        console.error("DEBUG: Error minting tokens:", error);
        if (error instanceof Error) {
          console.error("DEBUG: Error stack:", error.stack);
        }
        throw new Error(`Token minting failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Compress tokens using improved method
      updateProgress('Compressing tokens...');
      console.log("DEBUG: Compressing tokens...");
      try {
        // 1. Fetch & Select state tree infos
        console.log("DEBUG: Fetching state tree infos");
        const treeInfos = await rpc.getStateTreeInfos();
        console.log("DEBUG: State tree infos:", JSON.stringify(treeInfos?.map(info => typeof info === 'object' ? { keys: Object.keys(info) } : 'not an object')));
        
        if (!treeInfos || treeInfos.length === 0) {
          throw new Error("No state tree infos found");
        }
        
        console.log("DEBUG: Selecting state tree info from", treeInfos.length, "available trees");
        const treeInfo = selectStateTreeInfo(treeInfos);
        console.log("DEBUG: Selected state tree info - keys available:", treeInfo ? Object.keys(treeInfo) : "undefined");

        // 2. Fetch & Select token pool info
        console.log("DEBUG: Fetching token pool infos for mint:", mint.publicKey.toString());
        const tokenPoolInfos = await getTokenPoolInfos(rpc, mint.publicKey);
        console.log("DEBUG: Token pool infos:", JSON.stringify(tokenPoolInfos?.map(info => typeof info === 'object' ? { keys: Object.keys(info) } : 'not an object')));
        
        if (!tokenPoolInfos || tokenPoolInfos.length === 0) {
          throw new Error("No token pool infos found for this mint");
        }
        
        console.log("DEBUG: Selecting token pool info from", tokenPoolInfos.length, "available pools");
        const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);
        console.log("DEBUG: Selected token pool info - keys available:", tokenPoolInfo ? Object.keys(tokenPoolInfo) : "undefined");

        // 3. Build compress instruction
        console.log("DEBUG: Building compress instruction with parameters:", {
          payer: wallet.publicKey.toString(),
          source: ata.address.toString(),
          toAddress: wallet.publicKey.toString(),
          amount: mintAmount,
          mint: mint.publicKey.toString(),
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
        console.log("DEBUG: Getting latest blockhash for compress transaction");
        const latestBlockhash = await rpc.getLatestBlockhash();
        console.log("DEBUG: Got blockhash:", latestBlockhash.blockhash);
        
        // Create a signer that uses Privy wallet
        console.log("DEBUG: Creating signer");
        const signer = {
          publicKey: wallet.publicKey,
          signTransaction: async (tx: any) => {
            console.log("DEBUG: Inside signTransaction callback for compress transaction");
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
        console.error("DEBUG: Error compressing tokens:", error);
        if (error instanceof Error) {
          console.error("DEBUG: Error name:", error.name);
          console.error("DEBUG: Error message:", error.message);
          console.error("DEBUG: Error stack:", error.stack);
        } else {
          console.error("DEBUG: Non-Error object thrown:", error);
        }
        
        setError(`Compression failed: ${error instanceof Error ? error.message : String(error)}`);
        // Even if compression fails, we've still created the token
        return {
          mintAddress: mint.publicKey.toString(),
          txId: "compression-failed", // Indicate that compression failed but token was created
        };
      }
    } catch (err) {
      console.error('DEBUG: Error minting token:', err);
      if (err instanceof Error) {
        console.error("DEBUG: Error stack:", err.stack);
      }
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