import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import toast from 'react-hot-toast';
import { ActiveTab } from '../types/orders';

const useOrders = (activeTab: ActiveTab) => {
  const { user } = useAuth();

  const pendingAcceptanceQuery = api.orders.getPendingAcceptanceOrders.useQuery(
    { tailorId: user?.id || 0 },
    { enabled: Boolean(user?.id) && activeTab === 'pending-acceptance' }
  );

  const allOrdersQuery = api.orders.getTailorRecentOrders.useQuery(
    { tailorId: user?.id || 0 },
    { enabled: Boolean(user?.id) && activeTab === 'all' }
  );

  const acceptOrderMutation = api.orders.acceptOrder.useMutation({
    onSuccess: () => {
      toast.success('Order updated successfully');
      pendingAcceptanceQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });

  const handleAcceptOrder = (orderId: number, accept: boolean) => {
    const action = accept ? 'accept' : 'reject';
    if (confirm(`Are you sure you want to ${action} this order?`)) {
      acceptOrderMutation.mutate({ orderId, accept });
    }
  };

  const isLoading =
    activeTab === 'pending-acceptance'
      ? pendingAcceptanceQuery.isLoading
      : allOrdersQuery.isLoading;

  const orders =
    activeTab === 'pending-acceptance'
      ? pendingAcceptanceQuery.data?.orders || []
      : allOrdersQuery.data?.orders || [];

  const handleRefresh = () => {
    if (activeTab === 'pending-acceptance') {
      pendingAcceptanceQuery.refetch();
    } else {
      allOrdersQuery.refetch();
    }
  };

  return {
    orders,
    isLoading,
    handleAcceptOrder,
    handleRefresh,
  };
};

export default useOrders;
