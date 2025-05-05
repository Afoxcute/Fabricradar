'use client';

import React from 'react';
import Header from '@/components/header/header';
import { Table, Card, Col, Row, Tag, Button } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import BackgroundEffect from '@/components/background-effect/background-effect';
import { TailorNav } from '@/components/tailor/tailor-nav';
import './dashboard.css';  // Import custom CSS for styling antd components

const dataSource = [
  {
    key: '1',
    id: 'ORD001',
    customer: 'Jane Doe',
    status: 'Pending',
    date: '2025-05-01',
    price: '₦10,000',
    txHash: '0xabc123456789def',
  },
  {
    key: '2',
    id: 'ORD002',
    customer: 'John Smith',
    status: 'Completed',
    date: '2025-04-28',
    price: '₦15,000',
    txHash: '0xdef456789abc123',
  },
];

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
      <Tag color={status === 'Completed' ? 'green' : 'orange'}>{status}</Tag>
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
      <Link
        href={`https://solscan.io/tx/${hash}`}
        target="_blank"
        className="text-blue-400 underline"
      >
        {hash.slice(0, 10)}...
      </Link>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: any) => (
      <div className="flex gap-2">
        {record.status === 'Pending' ? (
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
              <p className="text-3xl font-bold text-white">56</p>
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Pending Orders</h3>
              <p className="text-3xl font-bold text-cyan-500">12</p>
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Completed Orders</h3>
              <p className="text-3xl font-bold text-green-500">38</p>
            </div>
            
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-gray-400 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-white">₦530,000</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
            
            <div className="overflow-x-auto">
              <Table 
                dataSource={dataSource} 
                columns={columns} 
                pagination={false}
                className="tailor-dashboard-table"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard; 