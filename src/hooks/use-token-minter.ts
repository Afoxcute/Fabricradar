import { useState } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { useConnection } from '@solana/wallet-adapter-react';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { createRpc } from '@lightprotocol/stateless.js';
import { createTokenPool, compress } from '@lightprotocol/compressed-token';
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
};

type MintResult = {
  mintAddress: string;
  txId: string;
};

export function useTokenMinter() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintToken2022 = async (options: TokenMintOptions): Promise<MintResult | null> => {
    if (!wallet.publicKey || !wallet.connected) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

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

      // Calculate space needed for mint with metadata pointer extension
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      // Get minimum lamports for rent exemption
      const mintLamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      // Create a transaction for initializing the mint and metadata
      const mintTransaction = new Transaction().add(
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
      const signedTransaction = await wallet.signTransaction(mintTransaction);
      signedTransaction.partialSign(mint);
      
      const txId = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(txId, 'confirmed');

      // Register the mint with the Compressed-Token program
      await createTokenPool(
        rpc,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet)
        } as any,
        mint.publicKey,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      // Create an Associated Token Account for the wallet
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet)
        } as any,
        mint.publicKey,
        wallet.publicKey,
        undefined,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      // Mint tokens to the wallet's token account
      const mintAmount = initialSupply * Math.pow(10, decimals);
      await mintTo(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet)
        } as any,
        mint.publicKey,
        ata.address,
        wallet.publicKey,
        mintAmount,
        undefined,
        undefined,
        TOKEN_2022_PROGRAM_ID
      );

      // Compress tokens
      const compressedTokenTxId = await compress(
        rpc,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet)
        } as any,
        mint.publicKey,
        mintAmount,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet)
        } as any,
        ata.address,
        wallet.publicKey
      );

      return {
        mintAddress: mint.publicKey.toString(),
        txId: compressedTokenTxId,
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