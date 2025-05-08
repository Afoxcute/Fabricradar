'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Coins, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useCluster } from '../cluster/cluster-data-access';
import { formatAddress } from '@/lib/utils';

interface TokenListProps {
  tailorId: number;
}

export function TokenList({ tailorId }: TokenListProps) {
  const { cluster } = useCluster();
  const { data, isLoading, error } = api.tokens.getTailorTokens.useQuery(
    { tailorId },
    { enabled: Boolean(tailorId) }
  );

  // Function to get Solana explorer URL for the token
  const getExplorerUrl = (mintAddress: string) => {
    const baseUrl = cluster.network?.includes('devnet')
      ? 'https://explorer.solana.com/?cluster=devnet'
      : 'https://explorer.solana.com';
    return `${baseUrl}/address/${mintAddress}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-500 mr-2" />
        <span className="text-gray-400">Loading tokens...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error loading tokens</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const tokens = data?.tokens || [];

  if (tokens.length === 0) {
    return (
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center">
        <Coins className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">No tokens created yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          You haven&apos;t created any reward tokens yet. Create your first token to offer it as a reward to your customers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Your Reward Tokens</h3>
      
      <div className="bg-gray-900/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mint Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Supply</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tokens.map((token) => (
                <tr key={token.id} className="bg-gray-900/20 hover:bg-gray-800/30">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-purple-600/20 rounded-full flex items-center justify-center mr-3">
                        <Coins className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-sm font-medium text-white">{token.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{token.symbol}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400 font-mono">{formatAddress(token.mintAddress)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {token.initialSupply.toLocaleString()} {token.symbol}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <a
                      href={getExplorerUrl(token.mintAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-500 hover:text-cyan-400 inline-flex items-center gap-1"
                    >
                      <ExternalLink size={14} />
                      <span className="text-sm">Explorer</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 