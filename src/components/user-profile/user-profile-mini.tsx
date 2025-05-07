'use client';

import React from 'react';
import { User, Settings, LogOut, Package, CreditCard } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function UserProfileMini() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  const navigateToProfile = () => {
    router.push('/profile');
  };
  
  const navigateToOrders = () => {
    router.push('/account');
  };
  
  const navigateToWallet = () => {
    router.push('/fund-wallet');
  };
  
  return (
    <div className="p-3 min-w-[220px]">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : 'Your Account'}
          </p>
          <p className="text-xs text-gray-400">{user.accountType || 'User'}</p>
        </div>
      </div>
      
      <ul className="space-y-2">
        <li>
          <button 
            onClick={navigateToProfile}
            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors text-left"
          >
            <Settings className="h-4 w-4 text-gray-400" />
            <span>My Profile</span>
          </button>
        </li>
        <li>
          <button 
            onClick={navigateToOrders}
            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors text-left"
          >
            <Package className="h-4 w-4 text-gray-400" />
            <span>My Orders</span>
          </button>
        </li>
        <li>
          <button 
            onClick={navigateToWallet}
            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors text-left"
          >
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span>Fund Wallet</span>
          </button>
        </li>
        {user.accountType === 'TAILOR' && (
          <li>
            <Link
              href="/tailor/dashboard"
              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition-colors text-left"
            >
              <span className="inline-block w-4 h-4 text-gray-400 text-center">🧵</span>
              <span>Tailor Dashboard</span>
            </Link>
          </li>
        )}
        <li className="pt-2 mt-2 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-red-800/30 text-red-400 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </li>
      </ul>
    </div>
  );
} 