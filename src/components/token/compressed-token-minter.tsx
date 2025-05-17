'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { Button } from '@/components/ui/button';
import { Loader2, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTokenMinter } from './useTokenMinter';

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
  // Use the hook from the separate file
  const tokenMinter = useTokenMinter();
  const wallet = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<string>('');

  // Track if we're loading from the hook
  const isLoading = tokenMinter.isLoading;

  const mintCompressedToken = async () => {
    if (!wallet.publicKey || !wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setError(null);

      const result = await tokenMinter.mintToken2022({
        decimals,
        initialSupply,
        metadata: {
          name,
          symbol,
          uri: '', // Optional metadata URI
          additionalMetadata: [
            ['created_at', new Date().toISOString()],
            ['token_type', 'reward'],
          ],
        },
        onProgress: (stage) => {
          setProgressStage(stage);
        },
      });

      if (result) {
      // Save mint address and transaction ID
        setMintAddress(result.mintAddress);
        setTxId(result.txId);
      setSuccess(true);

      // Notify parent component if callback provided
      if (onSuccess) {
          onSuccess(result.mintAddress);
      }

      toast.success('Compressed token created successfully!');
      } else {
        setError('Failed to create token - no result returned');
        toast.error('Failed to create token');
      }
    } catch (err) {
      console.error('Error minting token:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint token');
      toast.error('Failed to create token');
    }
  };

  // Use the error from the hook if available
  useEffect(() => {
    if (tokenMinter.error) {
      setError(tokenMinter.error);
    }
  }, [tokenMinter.error]);

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
          Create a compressed TOKEN-2022 on Solana to use as rewards for your customers. 
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
                  <code className="text-sm text-green-400">{mintAddress}</code>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400">
                  Transaction ID
                </label>
                <div className="bg-gray-800 p-2 rounded overflow-x-auto">
                  <code className="text-sm text-blue-400">{txId}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
              <h3 className="font-medium text-blue-500">{progressStage || 'Processing...'}</h3>
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
                  {progressStage || 'Creating Token...'}
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