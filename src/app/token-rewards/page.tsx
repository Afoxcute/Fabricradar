'use client';

import React from 'react';
import { CustomerTokenRewards } from '@/components/rewards/customer-token-rewards';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TokenRewardsPage() {
  const { user } = useAuth();
  const { connected } = useWallet();

  return (
    <div className="bg-gradient-to-b from-[#050b18] to-[#0a1428] min-h-screen text-white pb-16">
      <div className="container px-4 mx-auto pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-3">Token Rewards</h1>
            <p className="text-gray-400">View and manage your token rewards and redemptions</p>
          </div>

          {connected ? (
            <CustomerTokenRewards />
          ) : (
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">
                Connect your wallet to view your token rewards and redeem special offers
              </p>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              >
                Connect Wallet
              </Button>
            </div>
          )}

          <div className="mt-8 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">About cToken Rewards</h2>
            <p className="text-gray-300 mb-4">
              cTokens are compressed tokens on Solana that allow tailors to create and distribute rewards to their customers. These tokens can be redeemed for discounts, priority service, and other exclusive offers.
            </p>
            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 mb-4">
              <h3 className="text-blue-400 font-medium mb-2">How to Earn Tokens</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Complete orders with participating tailors</li>
                <li>• Refer friends to the Fabricradar platform</li>
                <li>• Participate in special promotions and events</li>
              </ul>
            </div>
            <div className="bg-green-900/20 border border-green-800 rounded-md p-4">
              <h3 className="text-green-400 font-medium mb-2">How to Redeem Tokens</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Browse available rewards from participating tailors</li>
                <li>• Select the reward you&apos;d like to redeem</li>
                <li>• Tokens will automatically be deducted from your balance</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <Link href="/marketplace">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2">
                  <span>Explore Marketplace</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 