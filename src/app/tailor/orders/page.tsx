'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Clock, Loader2, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TailorOrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending-acceptance' | 'all' | 'active' | 'completed'>('pending-acceptance');
  
  // Get pending acceptance orders (those that need tailor action within 48h)
  const pendingAcceptanceQuery = api.orders.getPendingAcceptanceOrders.useQuery(
    { tailorId: user?.id || 0 },
    { enabled: Boolean(user?.id) && activeTab === 'pending-acceptance' }
  );
  
  // Get all orders
  const allOrdersQuery = api.orders.getTailorRecentOrders.useQuery(
    { tailorId: user?.id || 0 },
    { enabled: Boolean(user?.id) && activeTab === 'all' }
  );
  
  // Accept/reject order mutation
  const acceptOrderMutation = api.orders.acceptOrder.useMutation({
    onSuccess: () => {
      toast.success('Order updated successfully');
      pendingAcceptanceQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order');
    }
  });
  
  const handleAcceptOrder = (orderId: number, accept: boolean) => {
    const action = accept ? 'accept' : 'reject';
    if (confirm(`Are you sure you want to ${action} this order?`)) {
      acceptOrderMutation.mutate({ orderId, accept });
    }
  };
  
  // Format relative time for deadline display
  const formatTimeLeft = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'Expired';
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} left`;
    }
    
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
  };
  
  // Get the query and data based on active tab
  const getActiveQuery = () => {
    switch (activeTab) {
      case 'pending-acceptance':
        return pendingAcceptanceQuery;
      case 'all':
        return allOrdersQuery;
      default:
        return pendingAcceptanceQuery;
    }
  };
  
  const activeQuery = getActiveQuery();
  const isLoading = activeQuery.isLoading;
  const orders = activeTab === 'pending-acceptance' 
    ? pendingAcceptanceQuery.data?.orders || []
    : allOrdersQuery.data?.orders || [];
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-600 hover:bg-green-700">Accepted</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Completed</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>;
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Access denied</p>
            <p className="text-sm text-red-400">You need to be logged in as a tailor to view this page</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      
      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-800 pb-4">
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'pending-acceptance' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          onClick={() => setActiveTab('pending-acceptance')}
        >
          Pending Acceptance
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders
        </button>
      </div>
      
      {/* Orders List */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={24} className="animate-spin text-cyan-500" />
            <span className="ml-2 text-gray-400">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'pending-acceptance' 
                ? "You don't have any orders pending acceptance." 
                : "You don't have any orders yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  {activeTab === 'pending-acceptance' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Deadline</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order: any) => (
                  <tr key={order.id} className="bg-gray-900/30 hover:bg-gray-800/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{order.description || 'No description'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{order.customerName}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">${order.price.toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    
                    {activeTab === 'pending-acceptance' && (
                      <>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1 text-yellow-500" />
                            <span className="text-sm text-yellow-500 font-medium">
                              {formatTimeLeft(order.acceptanceDeadline)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleAcceptOrder(order.id, true)}
                              disabled={acceptOrderMutation.isPending}
                            >
                              <Check size={16} className="mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleAcceptOrder(order.id, false)}
                              disabled={acceptOrderMutation.isPending}
                            >
                              <X size={16} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Refresh button */}
      <div className="mt-4 flex justify-end">
        <Button
          className="text-cyan-500 hover:text-cyan-400 border border-gray-800 hover:border-cyan-900"
          variant="outline"
          onClick={() => activeQuery.refetch()}
          disabled={activeQuery.isLoading}
        >
          <RefreshCw size={16} className={`mr-2 ${activeQuery.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
} 