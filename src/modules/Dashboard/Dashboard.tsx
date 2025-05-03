'use client';

import React from 'react';
import Header from '@/components/header/header';
import { Table, Card, Col, Row, Tag, Button } from 'antd';
import Link from 'next/link';

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
        href={`https://etherscan.io/tx/${hash}`}
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
              className="bg-green-600 border-none"
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

const Dashboard = () => {
  return (
    <div className="w-full min-h-screen px-6 py-6 bg-gray-950 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, Tailor!</h1>
        <p className="text-gray-400">
          Here’s what’s happening in your shop today.
        </p>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card
            title="Total Orders"
            className="bg-gray-900 border border-gray-800 text-white"
          >
            <p className="text-2xl font-bold">56</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Pending Orders"
            className="bg-gray-900 border border-gray-800 text-white"
          >
            <p className="text-2xl font-bold">12</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Completed Orders"
            className="bg-gray-900 border border-gray-800 text-white"
          >
            <p className="text-2xl font-bold">38</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Total Revenue"
            className="bg-gray-900 border border-gray-800 text-white"
          >
            <p className="text-2xl font-bold">₦530,000</p>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card
        title="Recent Orders"
        className="bg-gray-900 border border-gray-800 text-white"
        headStyle={{ color: 'white' }}
        bodyStyle={{ color: 'white' }}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowClassName={() => 'bg-gray-900 text-white'}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
