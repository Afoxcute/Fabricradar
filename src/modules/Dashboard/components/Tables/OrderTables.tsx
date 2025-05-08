import { Table, Tag, Button } from 'antd';
import Link from 'next/link';
import React from 'react';
import { OrderStatusEnum, OrderTableRow } from '../../types/orders';

interface OrdersTableProps {
  orders: OrderTableRow[];
  isLoading: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isLoading }) => {
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
        const colorMap = {
          [OrderStatusEnum.PENDING]: 'gold',
          [OrderStatusEnum.COMPLETED]: 'green',
          [OrderStatusEnum.ACCEPTED]: 'cyan',
          [OrderStatusEnum.REJECTED]: 'red',
        };

        return (
          <Tag color={colorMap[status as OrderStatusEnum]}>
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
      render: (_: string, record: OrderTableRow) => (
        <Link href={`/tailor/orders/${record.originalId}`}>
          <Button type="link" className="text-cyan-500 hover:text-cyan-400">
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        dataSource={orders}
        columns={columns}
        pagination={false}
        className="tailor-dashboard-table"
        loading={isLoading}
      />
    </div>
  );
};

export default OrdersTable;
