import React, { useState, useEffect } from 'react';
import { useCompressedToken } from '@/hooks/use-compressed-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Coins, ExternalLink } from 'lucide-react';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { shortenAddress } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function TokenMinter() {
  const { 
    mintTokens, 
    fetchTokenBalance, 
    tokenBalance, 
    isLoading, 
    isBalanceLoading,
    mintAddress
  } = useCompressedToken();
  const [amount, setAmount] = useState<number>(10);
  const { cluster } = useCluster();
  const router = useRouter();

  // Fetch token balance on mount
  useEffect(() => {
    fetchTokenBalance();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTokenBalance();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchTokenBalance]);

  const handleMint = async () => {
    if (!amount || amount <= 0) {
      return;
    }
    await mintTokens(amount);
  };

  const getExplorerUrl = (address: string) => {
    // Check if mainnet
    const baseUrl = cluster.network?.includes('mainnet') 
      ? 'https://explorer.solana.com/address/' 
      : 'https://explorer.solana.com/address/';
    
    // Add network parameter if not mainnet
    const networkParam = !cluster.network?.includes('mainnet') 
      ? `?cluster=${cluster.network || 'devnet'}` 
      : '';
    
    return `${baseUrl}${address}${networkParam}`;
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <Coins className="h-5 w-5 text-cyan-500 mr-2" />
        <h3 className="text-lg font-medium text-white">Compressed Token Manager</h3>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
          <span>Token Address:</span>
          <a 
            href={getExplorerUrl(mintAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-cyan-400 hover:underline"
          >
            {shortenAddress(mintAddress, 6, 4)}
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Your Balance:</span>
          {isBalanceLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <span className="font-medium text-white">
              {tokenBalance !== null ? tokenBalance.toLocaleString() : '—'}
            </span>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
          Amount to Mint
        </label>
        <Input
          id="amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      
      <Button
        onClick={handleMint}
        disabled={isLoading || amount <= 0}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Minting Tokens...</span>
          </>
        ) : (
          <>
            <Coins className="h-4 w-4 mr-2" />
            <span>Mint Tokens</span>
          </>
        )}
      </Button>
    </div>
  );
} 