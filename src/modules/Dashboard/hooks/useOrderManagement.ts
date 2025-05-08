import { api } from '@/trpc/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { OrderStatusEnum, OrderTableRow, PrismaOrder } from '../types/orders';

export const useOrderManagement = (userId: number) => {
  const [recentOrders, setRecentOrders] = useState<OrderTableRow[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = api.orders.getTailorRecentOrders.useQuery(
    { tailorId: userId || 0, limit: 10 },
    { enabled: !!userId }
  );

  const updateOrderStatus = api.orders.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success('Order status updated successfully');
      void refetchOrders();
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    },
  });

  const handleStatusUpdate = (orderId: number, status: OrderStatusEnum) => {
    updateOrderStatus.mutate({ orderId, status });
  };

  useEffect(() => {
    if (ordersData && !isOrdersLoading) {
      const formattedOrders = ordersData.orders.map((order: PrismaOrder) => ({
        key: order.id.toString(),
        id: order.orderNumber || `#${order.id}`,
        originalId: order.id,
        customer: order.customerName,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString(),
        price: `$${order.price.toFixed(2)}`,
        orderId: order.id,
      }));

      setRecentOrders(formattedOrders);
      setIsLoadingOrders(false);
    }
  }, [ordersData, isOrdersLoading]);

  return {
    recentOrders,
    isLoadingOrders,
    handleStatusUpdate,
    refetchOrders,
  };
};
