'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/header/header';
import { Table, Tag, Button, Spin } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import BackgroundEffect from '@/components/background-effect/background-effect';
import { TailorNav } from '@/components/tailor/tailor-nav';
import './dashboard.css';  // Import custom CSS for styling antd components
import axios from 'axios';
import { formatMoney } from '@/lib/utils';

// Interface for order metrics
interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

// Interface for order data
interface OrderData {
  key: string;
  id: string;
  customer: string;
  status: string;
  date: string;
  price: string;
  txHash?: string;
}

const columns = [
  {
    title: 'Order ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Customer',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'COMPLETED' ? 'green' : status === 'PENDING' ? 'orange' : 'blue'}>{status}</Tag>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Tx Hash',
    dataIndex: 'txHash',
    key: 'txHash',
    render: (hash: string) => (
      hash ? (
        <Link
          href={`https://solscan.io/tx/${hash}`}
          target="_blank"
          className="text-blue-400 underline"
        >
          {hash.slice(0, 10)}...
        </Link>
      ) : (
        <span className="text-gray-500">Not available</span>
      )
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: OrderData) => (
      <div className="flex gap-2">
        {record.status === 'PENDING' ? (
          <>
            <Button
              size="small"
              type="primary"
              className="bg-cyan-500 hover:bg-cyan-600 border-none"
            >
              Accept
            </Button>
            <Button size="small" danger>
              Reject
            </Button>
          </>
        ) : (
          <span className="text-gray-400">No Actions</span>
        )}
      </div>
    ),
  },
];

const TailorDashboard = () => {
  const { user, isLoading } = useAuth();
  const [metrics, setMetrics] = useState<OrderMetrics>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  useEffect(() => {
    // Only fetch data if user is logged in and is a tailor
    if (user && user.id && user.accountType === 'TAILOR') {
      fetchOrderMetrics(user.id);
      fetchRecentOrders(user.id);
    }
  }, [user]);
  
  const fetchOrderMetrics = async (userId: number) => {
    try {
      setIsLoadingMetrics(true);
      const response = await axios.get(`/api/orders/metrics?userId=${userId}`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching order metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };
  
  const fetchRecentOrders = async (userId: number) => {
    try {
      setIsLoadingOrders(true);
      const response = await axios.get(`/api/orders/recent?userId=${userId}`);
      
      // Transform the data to match the expected format
      const formattedOrders: OrderData[] = response.data.map((order: any) => ({
        key: order.id.toString(),
        id: order.orderId,
        customer: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Unknown Customer',
        status: order.status,
        date: new Date(order.date).toLocaleDateString(),
        price: `${order.price.toFixed(2)} USDC`,
        txHash: order.txHash,
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if not a tailor
  if (!user || user.accountType !== 'TAILOR') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="flex">
        <TailorNav />
        
        <div className="ml-64 flex-1 p-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-400 mt-2">
              Here&apos;s what&apos;s happening in your tailor shop today.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Orders</h3>
              {isLoadingMetrics ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-white">{metrics.totalOrders}</p>
              )}
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Pending Orders</h3>
              {isLoadingMetrics ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-cyan-500">{metrics.pendingOrders}</p>
              )}
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Completed Orders</h3>
              {isLoadingMetrics ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-green-500">{metrics.completedOrders}</p>
              )}
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Revenue</h3>
              {isLoadingMetrics ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-white">{metrics.totalRevenue.toFixed(2)} USDC</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
            
            <div className="overflow-x-auto">
              <Table 
                dataSource={orders} 
                columns={columns} 
                pagination={false}
                className="tailor-dashboard-table"
                loading={isLoadingOrders}
                locale={{ emptyText: 'No orders found' }}
              />
            </div>
            
            {/* Refresh button */}
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => {
                  if (user && user.id) {
                    fetchOrderMetrics(user.id);
                    fetchRecentOrders(user.id);
                  }
                }}
                className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard; 