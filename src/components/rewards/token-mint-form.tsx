'use client';

import React, { useState } from 'react';
import { useWallet } from '../solana/privy-solana-adapter';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '../ui/button';
import { Loader2, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';

// Token constants - would ideally be in an environment variable
const CTOKEN_MINT_ADDRESS = 'cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m';

interface TokenMintFormProps {
  onSuccess?: () => void;
}

export default function TokenMintForm({ onSuccess }: TokenMintFormProps) {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const [amount, setAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleMintToken = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setTransactionSignature('');

    try {
      // For this implementation, we'll simulate the token minting
      // since we don't have the full library integration yet
      
      // In a real integration, we would use the Light Protocol libraries
      // to create and send an actual token minting transaction

      toast.success(`Simulated minting ${amount} cTokens to your wallet`);
      
      // In a real implementation, we would store this in the database
      // and link it to the tailor's rewards
      
      if (onSuccess) {
        onSuccess();
      }

      setTransactionSignature('simulated-transaction-signature');
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      toast.error(error.message || 'Failed to mint tokens');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Mint Reward Tokens</h2>
      <p className="text-gray-400 mb-6">
        Mint cTokens as rewards that customers can redeem. These tokens will be stored in your wallet 
        and can be transferred to customers when they redeem rewards.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-300 mb-1">
            Token Amount
          </label>
          <div className="flex">
            <input
              type="number"
              id="tokenAmount"
              value={amount}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter amount to mint"
              min="1"
            />
            <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-700 bg-gray-700 text-gray-300">
              cTokens
            </span>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3 text-sm text-blue-400">
          <p className="flex items-center gap-2">
            <Coins size={16} className="shrink-0" />
            <span>Token will be minted to address: <strong>{connected ? 
              `${publicKey?.toString().slice(0, 6)}...${publicKey?.toString().slice(-4)}` : 
              'Not connected'}</strong>
            </span>
          </p>
        </div>
        
        <Button
          onClick={handleMintToken}
          disabled={isLoading || !connected}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Minting...</span>
            </>
          ) : (
            <>
              <Coins size={16} />
              <span>Mint Tokens</span>
            </>
          )}
        </Button>

        {transactionSignature && (
          <div className="bg-green-900/20 border border-green-800 rounded-md p-3 text-sm">
            <p className="text-green-400">Tokens minted successfully!</p>
            <p className="text-gray-400 mt-1 break-all">
              Transaction: {transactionSignature}
            </p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>Note: This is currently a simulation. In the final implementation, actual cTokens will be 
          minted to your wallet using the Light Protocol.</p>
        </div>
      </div>
    </div>
  );
} 