'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetUSDCBalance } from '@/components/account/account-data-access';
import { useWallet } from '@/components/solana/privy-solana-adapter';

interface TailorWalletHelperProps {
  variant?: 'default' | 'outline' | 'card';
  className?: string;
}

export function TailorWalletHelper({ 
  variant = 'default',
  className = ''
}: TailorWalletHelperProps) {
  const router = useRouter();
  const { publicKey } = useWallet();
  
  // Get USDC balance if wallet is connected
  const { data: usdcBalance, isLoading } = useGetUSDCBalance({
    address: publicKey!
  });
  
  const handleFundWallet = () => {
    router.push('/fund-wallet');
  };
  
  if (variant === 'card') {
    return (
      <div className={`bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-5 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Wallet Balance</h3>
            <div className="text-blue-400 font-semibold text-xl">
              {isLoading ? 
                <span className="text-gray-400 text-sm">Loading...</span> : 
                `${usdcBalance?.toFixed(2) || '0.00'} USDC`
              }
            </div>
          </div>
          <Wallet className="h-8 w-8 text-blue-500" />
        </div>
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
          onClick={handleFundWallet}
        >
          Fund Wallet
        </Button>
      </div>
    );
  }
  
  return (
    <Button
      variant={variant === 'outline' ? 'outline' : 'default'}
      className={`flex items-center gap-2 ${className}`}
      onClick={handleFundWallet}
    >
      <Wallet className="h-4 w-4" />
      <span>Fund Wallet</span>
    </Button>
  );
} 