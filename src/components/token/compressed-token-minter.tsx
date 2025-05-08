'use client';

import React, { useState } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { Button } from '@/components/ui/button';
import { Loader2, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTokenMinter } from '@/hooks/use-token-minter';

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
  symbol = 'token20222',
  name = 'Compressed TOKEN-2022 Token'
}: CompressedTokenMinterProps) {
  const wallet = useWallet();
  const { cluster } = useCluster();
  const { mintToken2022, isLoading, error } = useTokenMinter();
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'minting' | 'success' | 'error'>('idle');
  const [mintStage, setMintStage] = useState<string | null>(null);

  const handleMint = async () => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setStatus('minting');
      setMintStage('Initializing TOKEN-2022 mint...');
      console.log('Starting TOKEN-2022 mint process');
      
      const result = await mintToken2022({
        decimals,
        initialSupply,
        metadata: {
          name,
          symbol,
          uri: `https://token-metadata.solana.com/${wallet.publicKey?.toString()}/token.json`,
          additionalMetadata: [
            ['created_on', new Date().toISOString()],
            ['cluster', cluster.network || 'unknown'],
            ['type', 'token2022-compressed']
          ]
        }
      });

      if (result) {
        console.log('Mint successful:', result);
        setMintAddress(result.mintAddress);
        setStatus('success');
        if (onSuccess) {
          onSuccess(result.mintAddress);
        }
        toast.success('Token minted successfully');
      } else {
        setStatus('error');
        toast.error('Failed to mint token. See console for details.');
      }
    } catch (err) {
      console.error('Token minting error:', err);
      setStatus('error');
      toast.error('Error minting token');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-5 shadow-lg w-full max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Coins className="h-6 w-6 text-purple-500 mr-2" />
        <h2 className="text-xl font-semibold text-white">Mint Compressed TOKEN-2022</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Token Name
          </label>
          <div className="bg-gray-800 p-2 rounded text-gray-100">
            {name}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Symbol
          </label>
          <div className="bg-gray-800 p-2 rounded text-gray-100">
            {symbol}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Initial Supply
          </label>
          <div className="bg-gray-800 p-2 rounded text-gray-100">
            {initialSupply.toLocaleString()} tokens
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Decimals
          </label>
          <div className="bg-gray-800 p-2 rounded text-gray-100">
            {decimals}
          </div>
        </div>
        
        <div className="pt-3">
          <Button
            onClick={handleMint}
            disabled={isLoading || !wallet.connected || status === 'success'}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mintStage || 'Minting TOKEN-2022...'}
              </span>
            ) : status === 'success' ? (
              <span className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Token Minted
              </span>
            ) : (
              <span className="flex items-center">
                <Coins className="mr-2 h-4 w-4" />
                Mint TOKEN-2022
              </span>
            )}
          </Button>
        </div>
        
        {wallet.connected ? (
          <div className="text-green-500 text-sm flex items-center">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Wallet connected: {wallet.publicKey?.toString().slice(0, 5)}...{wallet.publicKey?.toString().slice(-5)}
          </div>
        ) : (
          <div className="text-amber-500 text-sm">
            Please connect your wallet to mint tokens
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
              <div>
                <h4 className="text-red-500 font-medium">Error Minting Token</h4>
                <p className="text-red-300 text-sm break-all">{error}</p>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-500">Token Created Successfully</h3>
                <p className="text-sm text-green-400 mt-1">Mint Address:</p>
                <div className="bg-gray-800 rounded p-2 mt-1 text-xs text-gray-300 break-all">
                  {mintAddress}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 