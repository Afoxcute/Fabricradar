'use client';

import React from 'react';
import { CustomerList } from '@/components/tailor/customer-list';
import { ProfileRedirectWrapper } from '@/components/user-profile/profile-redirect-wrapper';
import { TailorNav } from '@/components/tailor/tailor-nav';
import { useAuth } from '@/providers/auth-provider';
import { WalletButton } from '@/components/solana/solana-provider';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { Wallet, Users } from 'lucide-react';

export default function TailorCustomersPage() {
  const { user } = useAuth();
  const { connected } = useWallet();
  
  return (
    <ProfileRedirectWrapper>
      <div className="flex min-h-screen bg-black">
        <TailorNav />
        
        <div className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="h-8 w-8 mr-3 text-cyan-500" />
              Customer Management
            </h1>
            <p className="text-gray-400 mt-2">
              View all your customers, their order history, and send them reward tokens.
            </p>
          </div>
          
          {!connected && (
            <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-6 mb-8">
              <div className="flex items-start">
                <Wallet className="h-12 w-12 text-cyan-500 mr-4" />
                <div>
                  <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-400 mb-4">
                    Connect your Solana wallet to view your customers and send them reward tokens.
                  </p>
                  <WalletButton />
                </div>
              </div>
            </div>
          )}
          
          {!user || user.accountType !== 'TAILOR' ? (
            <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
              <Users className="h-12 w-12 mx-auto text-gray-600 mb-3" />
              <h3 className="text-lg font-medium mb-2">Tailor Access Required</h3>
              <p className="text-gray-400">
                You need to be logged in as a tailor to access this page.
              </p>
            </div>
          ) : (
            <CustomerList />
          )}
        </div>
      </div>
    </ProfileRedirectWrapper>
  );
} 