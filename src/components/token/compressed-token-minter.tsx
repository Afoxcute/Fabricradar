'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Loader2, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createRpc } from '@lightprotocol/stateless.js';
import { createTokenPool } from '@lightprotocol/compressed-token';
import {
  createMint,
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
  initialSupply = 5, // Changed from 1000000000 to just 5 tokens
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
  const [poolTxId, setPoolTxId] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'creating-mint' | 'registering-compression' | 'minting-supply'>('idle');

  const mintCompressedToken = async () => {
    if (!wallet.publicKey || !wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setStep('creating-mint');

      // Use environment variable for RPC endpoint
      const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
      if (!RPC_ENDPOINT) {
        throw new Error('RPC_ENDPOINT not configured. Please set the NEXT_PUBLIC_RPC_ENDPOINT environment variable.');
      }

      // Create RPC connection for Light Protocol
      const rpc = createRpc(RPC_ENDPOINT);

      // We need to create an adapter between Privy wallet and the mint function
      const walletAdapter = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction.bind(wallet)
      };

      // STEP 1: Create an SPL token mint (regular SPL token, not compressed yet)
      console.log('Step 1: Creating SPL token mint...');
      const mint = await createMint(
        connection,
        walletAdapter as any,
        wallet.publicKey,
        wallet.publicKey, // Freeze authority (can be null)
        decimals
      );
      
      // STEP 2: Register the mint for compression
      setStep('registering-compression');
      console.log('Step 2: Registering mint for compression...');
      const registerTxId = await createTokenPool(
        rpc,
        walletAdapter as any,
        mint
      );
      console.log(`Mint registered for compression. Transaction: ${registerTxId}`);
      setPoolTxId(registerTxId);

      // STEP 3: Create an associated token account for the wallet
      setStep('minting-supply');
      console.log('Step 3: Creating associated token account...');
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        walletAdapter as any,
        mint,
        wallet.publicKey
      );
      console.log(`Associated token account created: ${ata.address.toBase58()}`);

      // STEP 4: Mint initial supply to the wallet
      console.log('Step 4: Minting initial supply...');
      const mintAmount = initialSupply * Math.pow(10, decimals);
      const mintToTxId = await mintTo(
        connection,
        walletAdapter as any,
        mint,
        ata.address,
        wallet.publicKey,
        mintAmount
      );
      console.log(`Minted ${initialSupply} tokens to ${ata.address.toBase58()}`); // Just minting 5 tokens now
      console.log(`Mint transaction: ${mintToTxId}`);

      // Save mint address and transaction ID
      setMintAddress(mint.toBase58());
      setTxId(mintToTxId);
      setSuccess(true);

      // Notify parent component if callback provided
      if (onSuccess) {
        onSuccess(mint.toBase58());
      }

      toast.success('Compressed token created successfully!');
    } catch (err) {
      console.error('Error minting token:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint token');
      toast.error('Failed to create token');
    } finally {
      setIsLoading(false);
      setStep('idle');
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
            
            {/* Progress indicators */}
            {isLoading && (
              <div className="md:col-span-2 bg-gray-800/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-purple-400 mb-2">Creating Token</h3>
                
                <div className={`flex items-center ${step === 'creating-mint' || step === 'registering-compression' || step === 'minting-supply' ? 'text-purple-400' : 'text-gray-500'}`}>
                  {step === 'creating-mint' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : step === 'registering-compression' || step === 'minting-supply' ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-600 mr-2" />
                  )}
                  <span className="text-sm">1. Creating SPL Token Mint</span>
                </div>
                
                <div className={`flex items-center ${step === 'registering-compression' || step === 'minting-supply' ? 'text-purple-400' : 'text-gray-500'}`}>
                  {step === 'registering-compression' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : step === 'minting-supply' ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-600 mr-2" />
                  )}
                  <span className="text-sm">2. Registering for Compression</span>
                </div>
                
                <div className={`flex items-center ${step === 'minting-supply' ? 'text-purple-400' : 'text-gray-500'}`}>
                  {step === 'minting-supply' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-600 mr-2" />
                  )}
                  <span className="text-sm">3. Minting Initial Supply</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-green-500">Token Created Successfully</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400">
                  Mint Address
                </label>
                <div className="bg-gray-800 p-2 rounded overflow-x-auto">
                  <code className="text-sm text-green-400">{mintAddress}</code>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400">
                  Compression Registration
                </label>
                <div className="bg-gray-800 p-2 rounded overflow-x-auto">
                  <code className="text-sm text-blue-400">{poolTxId}</code>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400">
                  Mint Transaction
                </label>
                <div className="bg-gray-800 p-2 rounded overflow-x-auto">
                  <code className="text-sm text-blue-400">{txId}</code>
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
                setPoolTxId(null);
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