'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../solana/privy-solana-adapter';
import { useConnection } from '@solana/wallet-adapter-react';
import { Button } from '../ui/button';
import { Loader2, Coins, Wallet, RefreshCw, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { TokenService, CTOKEN_MINT_ADDRESS } from '@/services/TokenService';
import { db } from '@/server/db';

export function CustomerTokenRewards() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<Array<{
    id: string;
    amount: number;
    date: string;
    description: string;
  }>>([]);

  // Create token service instance
  const tokenService = new TokenService(db);

  // Simulate recent redemptions
  useEffect(() => {
    // This would be replaced with actual data from the database in a real implementation
    setRecentRedemptions([
      {
        id: '1',
        amount: 50,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Redeemed for 10% discount'
      },
      {
        id: '2',
        amount: 100,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Redeemed for priority service'
      },
    ]);
  }, []);

  const fetchTokenBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setTokenBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the token service to get the real balance
      const balance = await tokenService.getTokenBalance(
        publicKey.toString(),
        connection
      );
      setTokenBalance(balance);
    } catch (err: any) {
      console.error('Error fetching token balance:', err);
      setError(err.message || 'Failed to fetch token balance');
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, connection, tokenService]);

  useEffect(() => {
    fetchTokenBalance();
  }, [fetchTokenBalance]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Your Token Rewards</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={fetchTokenBalance}
            disabled={isLoading}
            className="text-cyan-400 border-cyan-900 hover:bg-cyan-950/20"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center">
            <Coins size={32} className="text-cyan-500" />
          </div>
          
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 size={20} className="animate-spin mr-2 text-cyan-500" />
              <span className="text-gray-400">Loading balance...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">
              Error: {error}
            </div>
          ) : (
            <div>
              <h3 className="text-3xl font-bold text-white">
                {tokenBalance !== null ? tokenBalance.toLocaleString() : '0'}
              </h3>
              <p className="text-gray-400">cTokens available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4">
            <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
              <Wallet size={16} />
              <span>Reward Token</span>
            </h3>
            <p className="text-gray-300 text-sm mb-1">Token mint address:</p>
            <p className="font-mono text-xs text-gray-400 break-all">{CTOKEN_MINT_ADDRESS}</p>
          </div>
          
          <div className="bg-green-900/20 border border-green-800 rounded-md p-4">
            <h3 className="text-green-400 font-medium mb-2">Redeem Your Tokens</h3>
            <p className="text-gray-300 text-sm">
              Use your tokens for exclusive discounts and rewards with participating tailors.
            </p>
            <Button
              size="sm"
              className="mt-2 bg-green-700 hover:bg-green-800"
              onClick={() => toast.success('Coming soon: Token redemption marketplace')}
            >
              Explore Rewards
            </Button>
          </div>
        </div>

        {recentRedemptions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Recent Redemptions</h3>
            <div className="space-y-3">
              {recentRedemptions.map((redemption) => (
                <div 
                  key={redemption.id}
                  className="bg-gray-800/60 p-3 rounded-md border border-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-900/30 w-8 h-8 rounded-full flex items-center justify-center">
                      <ArrowDown size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{redemption.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(redemption.date)}</p>
                    </div>
                  </div>
                  <div className="text-red-500 font-medium">-{redemption.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 