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
import DesignList from '@/components/design/design-list';

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
  
  // Effect to process order data when loaded
  useEffect(() => {
    if (ordersData && !isOrdersLoading) {
      // Transform orders into table format
      const formattedOrders = ordersData.orders.map((order: PrismaOrder) => ({
        key: order.id.toString(),
        id: order.orderNumber,
        customer: order.customerName,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString(),
        price: `${order.price.toFixed(2)} USDC`,
        txHash: order.txHash || 'N/A',
        orderId: order.id
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
      render: (_: any, record: OrderTableRow) => {
        if (record.status === OrderStatusEnum.PENDING) {
          return (
            <div className="flex gap-2">
              <Button
                size="small"
                type="primary"
                className="bg-cyan-500 hover:bg-cyan-600 border-none"
                onClick={() => handleAcceptOrder(record.orderId)}
                loading={updateOrderStatus.isPending}
              >
                Accept
              </Button>
              <Button 
                size="small" 
                danger 
                onClick={() => handleRejectOrder(record.orderId)}
                loading={updateOrderStatus.isPending}
              >
                Reject
              </Button>
            </div>
          );
        } else if (record.status === OrderStatusEnum.ACCEPTED) {
          return (
            <Button
              size="small"
              type="primary"
              className="bg-green-500 hover:bg-green-600 border-none"
              onClick={() => handleCompleteOrder(record.orderId)}
              loading={updateOrderStatus.isPending}
            >
              Complete
            </Button>
          );
        } else {
          return <span className="text-gray-400">No Actions</span>;
        }
      },
    },
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
  
  // Check if user is not logged in or not a tailor
  if (!user || user.accountType !== 'TAILOR') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="mb-8">This dashboard is only available for tailor accounts.</p>
          <Link href="/" className="text-cyan-500 hover:text-cyan-400">
            Return to Home
          </Link>
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
          <h1 className="text-3xl font-bold text-white mb-8">Tailor Dashboard</h1>
          
          {/* Stats Cards */}
          <Row gutter={[16, 16]} className="mb-8">
            <Col span={6}>
              <Card className="dashboard-card">
                <h3 className="text-lg mb-2 text-gray-400">Total Orders</h3>
                {isSummaryLoading ? (
                  <Spin size="small" />
                ) : (
                  <p className="text-2xl font-bold">{orderSummary.totalOrders}</p>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card className="dashboard-card">
                <h3 className="text-lg mb-2 text-gray-400">Pending Orders</h3>
                {isSummaryLoading ? (
                  <Spin size="small" />
                ) : (
                  <p className="text-2xl font-bold">{orderSummary.pendingOrders}</p>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card className="dashboard-card">
                <h3 className="text-lg mb-2 text-gray-400">Completed Orders</h3>
                {isSummaryLoading ? (
                  <Spin size="small" />
                ) : (
                  <p className="text-2xl font-bold">{orderSummary.completedOrders}</p>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card className="dashboard-card">
                <h3 className="text-lg mb-2 text-gray-400">Total Revenue</h3>
                {isSummaryLoading ? (
                  <Spin size="small" />
                ) : (
                  <p className="text-2xl font-bold">{orderSummary.totalRevenue.toFixed(2)} USDC</p>
                )}
              </Card>
            </Col>
          </Row>
          
          {/* Recent Orders */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recent Orders</h2>
              <Link 
                href="/tailor/orders" 
                className="text-cyan-500 hover:text-cyan-400 hover:underline"
              >
                View All Orders
              </Link>
            </div>
            
            <Card className="dashboard-card">
              {isLoadingOrders ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-400">Loading orders...</p>
                </div>
              ) : recentOrders.length > 0 ? (
                <Table 
                  dataSource={recentOrders} 
                  columns={columns} 
                  pagination={false}
                  className="custom-table"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No orders found</p>
                </div>
              )}
            </Card>
          </div>
          
          {/* Recent Designs */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Your Designs</h2>
              <Link 
                href="/tailor/designs" 
                className="text-cyan-500 hover:text-cyan-400 hover:underline"
              >
                Manage Designs
              </Link>
            </div>
            
            <Card className="dashboard-card">
              {user && (
                <DesignList tailorId={user.id} showActions={false} limit={3} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard; 