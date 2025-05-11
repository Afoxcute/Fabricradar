import React from 'react';
import { CustomerOrders } from '@/components/order/customer-orders';

const OrdersTab: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">My Orders</h1>
    </div>
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl md:p-6 px-4">
      <CustomerOrders limit={5} showFilters={true} />
    </div>
  </div>
);

export default OrdersTab;
