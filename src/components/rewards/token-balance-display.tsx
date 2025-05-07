'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../solana/privy-solana-adapter';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Loader2, Wallet, RefreshCw, Coins } from 'lucide-react';
import { Button } from '../ui/button';
import { TokenService, CTOKEN_MINT_ADDRESS } from '@/services/TokenService'; 

export default function TokenBalanceDisplay() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a TokenService instance
  const tokenService = new TokenService();

  const fetchTokenBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const balance = await tokenService.getTokenBalance(
        publicKey.toString(),
        connection
      );
      
      setTokenBalance(balance);
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setError('Failed to load token balance');
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, connection, tokenService]);

  // Fetch balance on component mount and when wallet changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenBalance();
    } else {
      setTokenBalance(null);
    }
  }, [connected, publicKey, fetchTokenBalance]);

  return (
    <div className="bg-gray-900/70 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Coins className="mr-2 h-5 w-5 text-blue-400" />
          cToken Balance
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchTokenBalance}
          disabled={isLoading || !connected}
          className="h-8 px-2 text-xs"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      {!connected ? (
        <div className="text-center py-4 text-gray-400">
          <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Connect your wallet to view your balance</p>
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm py-2">{error}</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-400" />
          <span>Loading balance...</span>
        </div>
      ) : (
        <div className="text-center py-4">
          <span className="text-3xl font-bold text-blue-400">{tokenBalance !== null ? tokenBalance.toLocaleString() : '0'}</span>
          <span className="ml-2 text-sm text-gray-400">cTokens</span>
          
          {tokenBalance === 0 && (
            <p className="text-sm text-gray-400 mt-2">
              You don&apos;t have any cTokens yet
            </p>
          )}
        </div>
      )}
    </div>
  );
} 