'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Edit, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { formatPhoneNumber } from '@/lib/utils';

interface UserProfileCardProps {
  className?: string;
  showEditButton?: boolean;
  showWalletInfo?: boolean;
}

export function UserProfileCard({ 
  className = '', 
  showEditButton = true, 
  showWalletInfo = true 
}: UserProfileCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const navigateToEdit = () => {
    router.push('/profile');
  };
  
  const navigateToFundWallet = () => {
    router.push('/fund-wallet');
  };
  
  if (!user) {
    return (
      <div className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center ${className}`}>
        <p className="text-gray-400">Please sign in to view your profile</p>
        <Link href="/auth/signin">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : 'Your Profile'}
          </h2>
          <p className="text-sm text-gray-400">{user.accountType || 'User'}</p>
        </div>
        {showEditButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={navigateToEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm text-gray-400 mb-1">Full Name</h3>
          <p className="font-medium">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : '(Not provided)'}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm text-gray-400 mb-1">Email</h3>
          <p className="font-medium">{user.email || '(Not provided)'}</p>
        </div>
        
        <div>
          <h3 className="text-sm text-gray-400 mb-1">Phone</h3>
          <p className="font-medium">
            {user.phone 
              ? formatPhoneNumber(user.phone) 
              : '(Not provided)'}
          </p>
        </div>
        
        {showWalletInfo && (
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Wallet</h3>
            {user.walletAddress ? (
              <div className="flex items-center">
                <p className="font-mono text-sm truncate max-w-[240px]">
                  {user.walletAddress}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2"
                  onClick={navigateToFundWallet}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Fund
                </Button>
              </div>
            ) : (
              <p className="text-amber-400 text-sm">No wallet connected</p>
            )}
          </div>
        )}
        
        {user.accountType === 'TAILOR' && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <Link href="/tailor/dashboard">
              <Button className="w-full bg-cyan-700 hover:bg-cyan-600">
                Tailor Dashboard
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 