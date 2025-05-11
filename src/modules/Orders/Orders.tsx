'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActiveTab } from './types/orders';
import { useOrders } from './hooks';
import { OrdersTable, TabBar } from './components';

function TailorOrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pending-acceptance');

  const { orders, isLoading, handleAcceptOrder, handleRefresh } =
    useOrders(activeTab);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Access denied</p>
            <p className="text-sm text-red-400">
              You need to be logged in as a tailor to view this page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto md:p-6 p-3">
      <h1 className="md:text-2xl text-xl font-bold mb-6">Manage Orders</h1>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={24} className="animate-spin text-cyan-500" />
            <span className="ml-2 text-gray-400">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'pending-acceptance'
                ? "You don't have any orders pending acceptance."
                : "You don't have any orders yet."}
            </p>
          </div>
        ) : (
          <OrdersTable
            orders={orders}
            activeTab={activeTab}
            onAcceptOrder={handleAcceptOrder}
          />
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="text-gray-400 border-gray-700 hover:bg-gray-800"
        >
          <RefreshCw size={14} className="mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
}

export default TailorOrdersPage;
