'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/header/header';
import { Table, Card, Col, Row, Tag, Button, Spin } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import BackgroundEffect from '@/components/background-effect/background-effect';
import { TailorNav } from '@/components/tailor/tailor-nav';
import './dashboard.css';  // Import custom CSS for styling antd components
import { api } from '@/trpc/react';
import toast from 'react-hot-toast';
import { JsonValue } from '@prisma/client/runtime/library';

// Define our local OrderStatus enum to match Prisma's enum
enum OrderStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

// Interface matching the Prisma model structure
interface PrismaOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  status: string; // This will be the Prisma enum value as a string
  price: number;
  txHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  tailorId: number;
  description: string | null;
  measurements: JsonValue;
}

// Transformed interface for order table rows
interface OrderTableRow {
  key: string;
  id: string;
  customer: string;
  status: string;
  date: string;
  price: string;
  txHash: string;
  orderId: number;
}

const TailorDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  // Fetch order summary data using tRPC
  const { 
    data: summaryData, 
    isLoading: isSummaryLoading,
    refetch: refetchSummary
  } = api.orders.getTailorOrderSummary.useQuery(
    { tailorId: user?.id || 0 },
    { enabled: !!user?.id }
  );
  
  // Fetch recent orders using tRPC
  const { 
    data: ordersData, 
    isLoading: isOrdersLoading,
    refetch: refetchOrders
  } = api.orders.getTailorRecentOrders.useQuery(
    { tailorId: user?.id || 0, limit: 10 },
    { enabled: !!user?.id }
  );
  
  // Update order status mutation
  const updateOrderStatus = api.orders.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success('Order status updated successfully');
      // Refetch order data
      void refetchOrderData();
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  });
  
  // Function to refetch order data
  const refetchOrderData = async () => {
    try {
      await refetchSummary();
      await refetchOrders();
    } catch (error) {
      console.error('Error refetching data:', error);
    }
  };
  
  // Handle accepting an order
  const handleAcceptOrder = (orderId: number) => {
    updateOrderStatus.mutate({
      orderId,
      status: OrderStatusEnum.ACCEPTED
    });
  };
  
  // Handle rejecting an order
  const handleRejectOrder = (orderId: number) => {
    updateOrderStatus.mutate({
      orderId,
      status: OrderStatusEnum.REJECTED
    });
  };
  
  // Handle completing an order
  const handleCompleteOrder = (orderId: number) => {
    updateOrderStatus.mutate({
      orderId,
      status: OrderStatusEnum.COMPLETED
    });
  };
  
  // Effect to update state when data is loaded
  useEffect(() => {
    if (summaryData && !isSummaryLoading) {
      setOrderSummary(summaryData);
    }
  }, [summaryData, isSummaryLoading]);
  
  // Process orders data when it changes
  useEffect(() => {
    if (ordersData && !isOrdersLoading) {
      // Map orders data to table format
      const formattedOrders = ordersData.orders.map((order: any) => ({
        key: order.id,
        id: order.orderNumber || `#${order.id}`,
        originalId: order.id, // Keep the original ID for linking to order details
        customer: order.customerName,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString(),
        price: `$${order.price.toFixed(2)}`,
        orderId: order.id // Required for action buttons
      }));
      
      setRecentOrders(formattedOrders);
      setIsLoadingOrders(false);
    }
  }, [ordersData, isOrdersLoading]);
  
  // Column definitions for the order table
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <span className="text-cyan-500">{text}</span>,
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
      render: (status: string) => {
        let color = 'blue';
        if (status === OrderStatusEnum.PENDING) color = 'gold';
        else if (status === OrderStatusEnum.COMPLETED) color = 'green';
        else if (status === OrderStatusEnum.ACCEPTED) color = 'cyan';
        else if (status === OrderStatusEnum.REJECTED) color = 'red';
        
        return (
          <Tag color={color}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Tag>
        );
      },
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
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Link href={`/tailor/orders/${record.originalId}`}>
          <Button type="link" className="text-cyan-500 hover:text-cyan-400">
            View Details
          </Button>
        </Link>
      ),
    }
  ];
  
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
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="flex">
        <TailorNav />
        
        <div className="ml-64 flex-1 p-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.firstName}!</h1>
            <p className="text-gray-400 mt-2">
              Here&apos;s what&apos;s happening in your tailor shop today.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Orders</h3>
              {isSummaryLoading ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-white">{orderSummary.totalOrders}</p>
              )}
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Pending Orders</h3>
              {isSummaryLoading ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-cyan-500">{orderSummary.pendingOrders}</p>
              )}
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Completed Orders</h3>
              {isSummaryLoading ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-green-500">{orderSummary.completedOrders}</p>
              )}
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Revenue</h3>
              {isSummaryLoading ? (
                <Spin size="small" />
              ) : (
                <p className="text-3xl font-bold text-white">{orderSummary.totalRevenue.toFixed(2)} USDC</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
            
            <div className="overflow-x-auto">
              {isLoadingOrders ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : recentOrders.length > 0 ? (
                <Table 
                  dataSource={recentOrders} 
                  columns={columns} 
                  pagination={false}
                  className="tailor-dashboard-table"
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No orders found. Orders will appear here once customers place them.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard; 