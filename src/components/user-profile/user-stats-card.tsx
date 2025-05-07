'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Clock, Package, CheckCircle, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserStatsCardProps {
  className?: string;
}

export function UserStatsCard({ className = '' }: UserStatsCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Fetch user's orders for stats
  const { data: orderStats, isLoading: isLoadingStats } = api.orders.getCustomerOrderStats.useQuery(
    { userId: user?.id || 0 },
    { enabled: Boolean(user?.id) }
  );
  
  const navigateToOrders = () => {
    router.push('/orders');
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Your Activity</h2>
      
      {isLoadingStats ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-700/40 animate-pulse h-24 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30 flex flex-col items-center cursor-pointer hover:bg-blue-900/30 transition-colors"
            onClick={navigateToOrders}
          >
            <Package className="h-8 w-8 text-blue-400 mb-2" />
            <span className="text-2xl font-bold">{orderStats?.totalOrders || 0}</span>
            <span className="text-sm text-gray-400">Total Orders</span>
          </div>
          
          <div 
            className="bg-green-900/20 p-4 rounded-lg border border-green-900/30 flex flex-col items-center cursor-pointer hover:bg-green-900/30 transition-colors"
            onClick={navigateToOrders}
          >
            <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
            <span className="text-2xl font-bold">{orderStats?.completedOrders || 0}</span>
            <span className="text-sm text-gray-400">Completed</span>
          </div>
          
          <div 
            className="bg-amber-900/20 p-4 rounded-lg border border-amber-900/30 flex flex-col items-center cursor-pointer hover:bg-amber-900/30 transition-colors"
            onClick={navigateToOrders}
          >
            <Clock className="h-8 w-8 text-amber-400 mb-2" />
            <span className="text-2xl font-bold">{orderStats?.pendingOrders || 0}</span>
            <span className="text-sm text-gray-400">In Progress</span>
          </div>
          
          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-900/30 flex flex-col items-center">
            <ShoppingBag className="h-8 w-8 text-purple-400 mb-2" />
            <span className="text-2xl font-bold">${orderStats?.totalSpent.toFixed(2) || '0.00'}</span>
            <span className="text-sm text-gray-400">Total Spent</span>
          </div>
        </div>
      )}
    </div>
  );
} 