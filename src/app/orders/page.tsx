'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Loader2, RefreshCw, Eye, CheckCircle, XCircle, Filter } from 'lucide-react';
import Header from '@/components/header/header';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Footer from '@/components/footer/footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Read URL parameters for initial filter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const statusParam = searchParams.get('status');
    
    if (statusParam && ['PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'].includes(statusParam)) {
      setStatusFilter(statusParam);
    }
  }, []);
  
  // Update URL when filter changes
  useEffect(() => {
    const url = new URL(window.location.href);
    
    if (statusFilter) {
      url.searchParams.set('status', statusFilter);
    } else {
      url.searchParams.delete('status');
    }
    
    // Update URL without triggering a full page reload
    window.history.pushState({}, '', url);
  }, [statusFilter]);
  
  // Fetch customer orders
  const { data, isLoading, error, refetch } = api.orders.getCustomerOrders.useQuery(
    { userId: user?.id || 0, limit: 50 },
    { enabled: Boolean(user?.id) }
  );
  
  // Filter orders based on status
  const filteredOrders = React.useMemo(() => {
    if (!data?.orders) return [];
    
    return statusFilter 
      ? data.orders.filter((order: any) => order.status === statusFilter)
      : data.orders;
  }, [data?.orders, statusFilter]);
  
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === null ? 'default' : 'outline'}
              onClick={() => setStatusFilter(null)}
              className={statusFilter === null ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            >
              All Orders
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PENDING')}
              className={statusFilter === 'PENDING' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('ACCEPTED')}
              className={statusFilter === 'ACCEPTED' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            >
              <Clock className="h-4 w-4 mr-1" />
              In Progress
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('COMPLETED')}
              className={statusFilter === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('REJECTED')}
              className={statusFilter === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rejected
            </Button>
          </div>
        </div>
        
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
          ) : filteredOrders.length > 0 ? (
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
                  {filteredOrders.map((order: any) => (
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
              <h3 className="text-xl font-semibold text-white mb-2">
                {statusFilter 
                  ? `No ${statusFilter.toLowerCase()} orders found` 
                  : "No orders found"}
              </h3>
              <p className="text-gray-400 mb-6">
                {statusFilter 
                  ? `You don't have any orders with ${statusFilter.toLowerCase()} status.` 
                  : "You haven't placed any orders yet."}
              </p>
              {!statusFilter && (
                <Link href="/designs" passHref>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    Browse Designs
                  </Button>
                </Link>
              )}
              {statusFilter && (
                <Button 
                  onClick={() => setStatusFilter(null)} 
                  variant="outline" 
                  className="border-cyan-500/30 text-cyan-400"
                >
                  View All Orders
                </Button>
              )}
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