'use client';

import React, { useState } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Loader2, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createRpc } from '@lightprotocol/stateless.js';
import { createMint } from '@lightprotocol/compressed-token';
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

interface CompressedTokenMinterProps {
  onSuccess?: (mintAddress: string) => void;
  decimals?: number;
  initialSupply?: number;
  symbol?: string;
  name?: string;
}

export function CompressedTokenMinter({
  onSuccess,
  decimals = 9,
  initialSupply = 1000000000, // 1 billion
  symbol = 'REWARD',
  name = 'Tailor Reward Token'
}: CompressedTokenMinterProps) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const mintCompressedToken = async () => {
    if (!wallet.publicKey || !wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // Reset state variables at the start to prevent stale data
      setMintAddress(null);
      setTxId(null);
      setSuccess(false);

      // Use environment variable for RPC endpoint
      const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
      if (!RPC_ENDPOINT) {
        throw new Error('RPC_ENDPOINT not configured. Please set the NEXT_PUBLIC_RPC_ENDPOINT environment variable.');
      }

      // Create RPC connection for Light Protocol
      const rpc = createRpc(RPC_ENDPOINT);

      // We need to create an adapter between Privy wallet and the mint function
      // which expects a keypair with a 'publicKey' property and a 'signTransaction' method
      const walletAdapter = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction.bind(wallet)
      };

      // Create a compressed token mint
      console.log('Creating compressed token mint...');
      const { mint, transactionSignature } = await createMint(
        rpc,
        walletAdapter as any, // Type assertion here since we're adapting the wallet interface
        wallet.publicKey,
        decimals,
        walletAdapter as any, // Mint authority
      );
      console.log(`Mint created with address: ${mint.toBase58()}`);
      console.log(`Transaction signature: ${transactionSignature}`);

      // Create an associated token account for the wallet
      console.log('Creating associated token account...');
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet)
        } as any,
        mint,
        wallet.publicKey
      );
      console.log(`Associated token account created: ${ata.address.toBase58()}`);

      // Mint initial supply to the wallet
      console.log('Minting initial supply...');
      const mintAmount = initialSupply * Math.pow(10, decimals);
      const mintToTxId = await mintTo(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction.bind(wallet)
        } as any,
        mint,
        ata.address,
        wallet.publicKey,
        mintAmount
      );
      console.log(`Minted ${initialSupply} tokens to ${ata.address.toBase58()}`);
      console.log(`Mint transaction: ${mintToTxId}`);

      // Save mint address and transaction ID
      const mintAddressString = mint.toBase58();
      setMintAddress(mintAddressString);
      setTxId(mintToTxId);
      setSuccess(true);

      // Notify parent component if callback provided
      if (onSuccess && mintAddressString) {
        onSuccess(mintAddressString);
      }

      toast.success('Compressed token created successfully!');
    } catch (err) {
      console.error('Error minting token:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint token');
      toast.error('Failed to create token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
          <Coins className="h-5 w-5 text-purple-500" />
        </div>
        <h2 className="text-xl font-semibold">Create Reward Token</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-400">
          Create a compressed token on Solana to use as rewards for your customers. 
          These tokens can be distributed as part of your reward program.
        </p>

        {!success ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Token Name
                </label>
                <p className="text-gray-400">{name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Token Symbol
                </label>
                <p className="text-gray-400">{symbol}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Decimals
                </label>
                <p className="text-gray-400">{decimals}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Initial Supply
                </label>
                <p className="text-gray-400">{initialSupply.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-green-500">Token Created Successfully</h3>
            </div>
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-400">
                  Mint Address
                </label>
                <div className="bg-gray-800 p-2 rounded overflow-x-auto">
                  <code className="text-sm text-green-400">{mintAddress || 'Address not available'}</code>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400">
                  Transaction ID
                </label>
                <div className="bg-gray-800 p-2 rounded overflow-x-auto">
                  <code className="text-sm text-blue-400">{txId || 'Transaction ID not available'}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-500">Error Creating Token</h3>
                <p className="text-sm text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {!success ? (
            <Button
              onClick={mintCompressedToken}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isLoading || !wallet.connected}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Token...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Mint Reward Token
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSuccess(false);
                setMintAddress(null);
                setTxId(null);
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Create Another Token
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 