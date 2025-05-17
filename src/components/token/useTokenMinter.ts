'use client';

import { useState } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TYPE_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMintToInstruction,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import {
  CompressedTokenProgram,
  getTokenPoolInfos,
  selectTokenPoolInfo,
} from "@lightprotocol/compressed-token";
import { createRpc, selectStateTreeInfo } from "@lightprotocol/stateless.js";
import BN from 'bn.js';

// Types for our interface
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
  compressTxId?: string;
};

// Helper function for sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useTokenMinter() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a token pool
  const createTokenPool = async (mint: PublicKey, updateProgress: (stage: string) => void): Promise<string | null> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    updateProgress('Creating token pool...');
    
    try {
      const createPoolIx = await CompressedTokenProgram.createTokenPool({
        feePayer: wallet.publicKey,
        mint: mint,
        tokenProgramId: TOKEN_2022_PROGRAM_ID,
      });
      
      const createPoolIxs = [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
        createPoolIx,
      ];

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      
      const tx = new Transaction().add(...createPoolIxs);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = blockhash;
      
      const signedTx = await wallet.signTransaction(tx);
      
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction({
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
        signature,
      }, 'confirmed');

      console.log(`Created Pool! txId: https://explorer.solana.com/tx/${signature}?cluster=${cluster.network}`);
      
      return signature;
    } catch (err) {
      console.error('Error creating token pool:', err);
      throw err;
    }
  };

  // Compress tokens
  const compressToken = async (
    ata: PublicKey,
    mint: PublicKey,
    poolSig: string,
    amount: number,
    updateProgress: (stage: string) => void
  ): Promise<string | null> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    updateProgress('Preparing to compress tokens...');
    
    try {
      // Use environment variable for RPC endpoint or fallback based on network
      const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 
        (cluster.network?.includes('mainnet') ? 
          'https://api.mainnet-beta.solana.com' : 
          'https://api.devnet.solana.com');
      
      // Create RPC connection for Light Protocol
      const lightConnection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);
      
      // Wait for pool transaction to be confirmed - need to wait longer to ensure pool is initialized
      updateProgress('Waiting for token pool to be initialized...');
      await sleep(10000); // Increased wait time to ensure pool is initialized
      
      // Get token pool info using the recommended approach
      updateProgress('Getting token pool info...');
      const tokenPoolInfos = await getTokenPoolInfos(lightConnection, mint);
      
      if (!tokenPoolInfos || tokenPoolInfos.length === 0) {
        throw new Error("No token pool found for this mint. Please ensure pool is created.");
      }
      
      // Select the appropriate token pool info
      const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);
      
      if (!tokenPoolInfo) {
        throw new Error("Could not select an appropriate token pool.");
      }
      
      console.log("Selected token pool PDA:", tokenPoolInfo.tokenPoolPda.toBase58());
      
      // Get and select state tree info
      updateProgress('Getting state tree info...');
      const stateTreeInfos = await lightConnection.getStateTreeInfos();
      const stateTreeInfo = selectStateTreeInfo(stateTreeInfos);
      
      // Create the compression instruction
      updateProgress('Creating compression instruction...');
      const compressInstruction = await CompressedTokenProgram.compress({
        payer: wallet.publicKey,
        toAddress: wallet.publicKey,
        outputStateTreeInfo: stateTreeInfo,
        owner: wallet.publicKey,
        source: ata,
        mint: mint,
        amount: new BN(amount),
        tokenPoolInfo: tokenPoolInfo, // Use the selected token pool info directly
      });
      
      // Create transaction with compute budget instruction
      updateProgress('Building compression transaction...');
      const compressTx = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
        compressInstruction
      );
      
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      compressTx.feePayer = wallet.publicKey;
      compressTx.recentBlockhash = blockhash;
      
      // Sign transaction
      updateProgress('Signing compression transaction...');
      const signedCompressTx = await wallet.signTransaction(compressTx);
      
      // Send and confirm transaction
      updateProgress('Sending compression transaction...');
      const compressSig = await connection.sendRawTransaction(signedCompressTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      updateProgress('Confirming compression transaction...');
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature: compressSig,
      }, 'confirmed');
      
      console.log(`Tokens compressed! txId: https://explorer.solana.com/tx/${compressSig}?cluster=${cluster.network}`);
      
      return compressSig;
    } catch (err) {
      console.error('Error compressing token:', err);
      throw err;
    }
  };

  const mintToken2022 = async (options: TokenMintOptions): Promise<MintResult | null> => {
    if (!wallet.publicKey || !wallet.connected) {
      setError('Wallet not connected');
      return null;
    }

    const updateProgress = (stage: string) => {
      if (options.onProgress) {
        options.onProgress(stage);
      }
    };

    try {
      setIsLoading(true);
      setError(null);
      updateProgress('Preparing transaction...');

      // Use environment variable for RPC endpoint or fallback based on network
      const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 
        (cluster.network?.includes('mainnet') ? 
          'https://api.mainnet-beta.solana.com' : 
          'https://api.devnet.solana.com');
      
      updateProgress('Creating token mint...');

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

      // Calculate space needed for mint with metadata pointer extension
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      // Get minimum lamports for rent exemption
      const mintLamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      // Get a recent blockhash
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

      // Sign and send the transaction
      updateProgress('Signing transaction...');
      console.log("Signing mint transaction with blockhash:", blockhash);
      const signedTransaction = await wallet.signTransaction(mintTransaction);
      signedTransaction.partialSign(mint);
      
      updateProgress('Sending transaction...');
      const txId = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log("Mint transaction sent, waiting for confirmation...");
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

      // Create associated token account and mint tokens in a second transaction
      updateProgress('Creating token account and minting tokens...');
      
      // Find the associated token account address
      const associatedTokenAddress = getAssociatedTokenAddressSync(
        mint.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      console.log("Associated token account address:", associatedTokenAddress.toString());

      // Calculate mint amount based on supply and decimals
      const mintAmount = BigInt(initialSupply * Math.pow(10, decimals));
      
      // Create a transaction to create the associated token account and mint tokens
      const mintToTransaction = new Transaction();
      
      // Add instruction to create associated token account
      mintToTransaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          associatedTokenAddress, // associated token account
          wallet.publicKey, // owner
          mint.publicKey, // mint
          TOKEN_2022_PROGRAM_ID, // token program
          ASSOCIATED_TOKEN_PROGRAM_ID // associated token program
        )
      );

      // Add instruction to mint tokens
      mintToTransaction.add(
        createMintToInstruction(
          mint.publicKey, // mint
          associatedTokenAddress, // destination
          wallet.publicKey, // authority
          mintAmount, // amount
          [], // multiSigners
          TOKEN_2022_PROGRAM_ID // token program
        )
      );
      
      // Get a fresh blockhash for this transaction
      const { blockhash: mintBlockhash, lastValidBlockHeight: mintLastValidHeight } = 
        await connection.getLatestBlockhash('finalized');
      
      mintToTransaction.recentBlockhash = mintBlockhash;
      mintToTransaction.feePayer = wallet.publicKey;
      
      // Sign the transaction
      const signedMintToTransaction = await wallet.signTransaction(mintToTransaction);
      
      // Send and confirm the transaction
      updateProgress('Minting tokens to your account...');
      const mintToTxId = await connection.sendRawTransaction(signedMintToTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      const mintToConfirmation = await connection.confirmTransaction({
        signature: mintToTxId,
        blockhash: mintBlockhash,
        lastValidBlockHeight: mintLastValidHeight
      }, 'confirmed');

      if (mintToConfirmation.value.err) {
        throw new Error(`Mint to transaction failed: ${mintToConfirmation.value.err.toString()}`);
      }

      console.log("Tokens minted successfully with txId:", mintToTxId);

      // Create token pool and compress tokens
      let tokenPoolSig: string | null = null;
      let compressTxId: string | null = null;
      
      try {
          // Create token pool
        updateProgress('Creating token pool for compression...');
        tokenPoolSig = await createTokenPool(mint.publicKey, updateProgress);
        
        if (tokenPoolSig) {
          console.log("Token pool created successfully with txId:", tokenPoolSig);
          
          // Compress a portion of the tokens (100,000 tokens for demonstration)
          const amountToCompress = 100000 * Math.pow(10, decimals);
          updateProgress('Compressing tokens...');
          
          compressTxId = await compressToken(
            associatedTokenAddress,
            mint.publicKey,
            tokenPoolSig,
            amountToCompress,
            updateProgress
          );
          
          if (compressTxId) {
            console.log("Tokens compressed successfully with txId:", compressTxId);
          }
        }
      } catch (err) {
        console.warn("Token pool creation or compression failed, but token was created successfully:", err);
      }
      
      updateProgress('Token minting complete!');

      // Return the mint address and transaction IDs
        return {
          mintAddress: mint.publicKey.toString(),
          txId: mintToTxId,
        compressTxId: compressTxId || undefined,
        };
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