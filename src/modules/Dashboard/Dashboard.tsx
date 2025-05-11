'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/trpc/react';
import { SummaryCard, OrdersTable } from './components';
import { useOrderManagement } from './hooks/useOrderManagement';

const Dashboardv2 = () => {
  const { user, isLoading: authLoading } = useAuth();

  const { data: summaryData, isLoading: isSummaryLoading } =
    api.orders.getTailorOrderSummary.useQuery(
      { tailorId: user?.id || 0 },
      { enabled: !!user?.id }
    );

  const { recentOrders, isLoadingOrders } = useOrderManagement(user?.id || 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Here&apos;s what&apos;s happening in your tailor shop today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Orders"
          value={summaryData?.totalOrders || 0}
          isLoading={isSummaryLoading}
        />
        <SummaryCard
          title="Pending Orders"
          value={summaryData?.pendingOrders || 0}
          isLoading={isSummaryLoading}
          valueColor="text-cyan-500"
        />
        <SummaryCard
          title="Completed Orders"
          value={summaryData?.completedOrders || 0}
          isLoading={isSummaryLoading}
          valueColor="text-green-500"
        />
        <SummaryCard
          title="Total Revenue"
          value={`${summaryData?.totalRevenue.toFixed(2) || '0.00'} USDC`}
          isLoading={isSummaryLoading}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
        {recentOrders.length > 0 ? (
          <OrdersTable orders={recentOrders} isLoading={isLoadingOrders} />
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>
              No orders found. Orders will appear here once customers place
              them.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboardv2;
