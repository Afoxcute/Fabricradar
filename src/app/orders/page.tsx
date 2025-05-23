'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Loader2, RefreshCw, Eye } from 'lucide-react';
import Header from '@/components/header/header';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Footer from '@/components/footer/footer';
import Link from 'next/link';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  
  // Fetch customer orders
  const { data, isLoading, error, refetch } = api.orders.getCustomerOrders.useQuery(
    { userId: user?.id || 0, limit: 50 },
    { enabled: Boolean(user?.id) }
  );
  
  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending Acceptance</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-cyan-600 hover:bg-cyan-700">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden">
        <BackgroundEffect />
        <Header />
        
        <div className="container mx-auto p-6">
          <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Access denied</p>
              <p className="text-sm text-red-400">You need to be logged in to view your orders</p>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden">
      <BackgroundEffect />
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={24} className="animate-spin text-cyan-500" />
              <span className="ml-2 text-gray-400">Loading your orders...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg">
              <p className="font-medium">Error loading orders</p>
              <p className="text-sm">{error.message || 'There was an error loading your orders. Please try again.'}</p>
            </div>
          ) : data?.orders && data.orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data.orders.map((order: any) => (
                    <tr key={order.id} className="bg-gray-900/30 hover:bg-gray-800/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{order.orderNumber || `#${order.id}`}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{order.description || 'Custom Order'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">${order.price.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <Link href={`/orders/${order.id}`} passHref>
                          <Button
                            size="sm"
                            variant="ghost" 
                            className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-900/20"
                          >
                            <Eye size={16} className="mr-1" />
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
              <p className="text-gray-400 mb-6">You haven&apos;t placed any orders yet.</p>
              <Link href="/designs" passHref>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  Browse Designs
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Refresh button */}
        {user && data?.orders && data.orders.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="text-gray-400 border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 