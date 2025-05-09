'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import {
  Loader2,
  ArrowLeft,
  Check,
  X,
  Clock,
  Package,
  Phone,
  Mail,
  Home,
  Calendar,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/header/header';
import { TailorNav } from '@/components/tailor/tailor-nav';
import BackgroundEffect from '@/components/background-effect/background-effect';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { OrderChat } from '@/components/order-chat/order-chat';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = Number(params.id);

  // Get order details
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = api.orders.getOrderById.useQuery(
    { orderId },
    { enabled: Boolean(orderId) && Boolean(user?.id) }
  );

  // Accept/reject order mutation
  const acceptOrderMutation = api.orders.acceptOrder.useMutation({
    onSuccess: () => {
      toast.success('Order updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });

  // Update order status mutation
  const updateOrderStatus = api.orders.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success('Order status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  // Handle accepting or rejecting an order
  const handleAcceptOrder = (accept: boolean) => {
    if (!order) return;

    const action = accept ? 'accept' : 'reject';
    if (confirm(`Are you sure you want to ${action} this order?`)) {
      acceptOrderMutation.mutate({ orderId: order.id, accept });
    }
  };

  // Handle updating order status
  const handleUpdateStatus = (status: string) => {
    if (!order) return;

    updateOrderStatus.mutate({
      orderId: order.id,
      status: status as 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED',
    });
  };

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge className="bg-cyan-600 hover:bg-cyan-700">Accepted</Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
        );
      case 'REJECTED':
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>;
      default:
        return (
          <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
        );
    }
  };

  // Format deadline time
  const formatDeadline = (deadline: string | Date | null | undefined) => {
    if (!deadline) return 'Unknown';
    const date = deadline instanceof Date ? deadline : new Date(deadline);
    const now = new Date();
    const diffHours = Math.round(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 0) {
      return 'Expired';
    } else if (diffHours < 1) {
      return 'Less than 1 hour';
    } else if (diffHours === 1) {
      return '1 hour';
    } else if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  };

  // Parse delivery and timeline data
  const getDeliveryInfo = () => {
    if (!order) return null;

    try {
      // When order data is properly stored
      if (
        typeof order.measurements === 'object' &&
        order.measurements !== null
      ) {
        const measurementsObj = order.measurements as Record<string, any>;

        // Try to find delivery info in the measurements object
        if (measurementsObj.delivery) {
          return measurementsObj.delivery;
        }
      }

      // Default delivery info
      return {
        method: 'Not specified',
        address: '',
        customTimeline: {
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
        },
      };
    } catch (error) {
      console.error('Error parsing delivery info:', error);
      return null;
    }
  };

  // Parse measurements based on gender
  const parseMeasurements = () => {
    if (!order || !order.measurements) return [];

    try {
      const measurementsObj = order.measurements as Record<string, string>;
      if (!measurementsObj) return [];

      // Convert measurements object to array of items
      return Object.entries(measurementsObj)
        .filter(([key, value]) => value && value.trim() !== '')
        .map(([key, value]) => {
          // Format the label from camelCase to Title Case with spaces
          const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());

          return {
            id: key,
            label,
            value,
          };
        });
    } catch (error) {
      console.error('Error parsing measurements:', error);
      return [];
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto p-6">
          <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
            <Loader2 size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Access denied</p>
              <p className="text-sm text-red-400">
                You need to be logged in as a tailor to view this page
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <div className="flex">
        <div className="flex-1 p-8 relative z-10">
          <div className="mb-6">
            <Link
              href="/tailor/orders"
              className="text-cyan-500 hover:text-cyan-400 flex items-center mb-2"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Orders
            </Link>

            <h1 className="text-2xl font-bold text-white">Order Details</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={24} className="animate-spin text-cyan-500" />
              <span className="ml-2 text-gray-400">
                Loading order details...
              </span>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg">
              <p className="font-medium">Error loading order</p>
              <p className="text-sm">
                There was an error loading this order. Please try again.
              </p>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {order.orderNumber}
                    </h2>
                    <p className="text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Status</p>
                      <div className="mt-1">
                        {renderStatusBadge(order.status)}
                      </div>
                    </div>

                    {order.status === 'PENDING' && !order.isAccepted && (
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Deadline</p>
                        <div className="flex items-center mt-1 text-amber-500">
                          <Clock size={14} className="mr-1" />
                          <span className="text-sm font-medium">
                            {formatDeadline(order.acceptanceDeadline)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="text-right">
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-xl font-bold text-white mt-1">
                        ${order.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {order.status === 'PENDING' && !order.isAccepted && (
                  <div className="mt-6 flex gap-3">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      onClick={() => handleAcceptOrder(true)}
                      disabled={acceptOrderMutation.isPending}
                    >
                      <Check size={16} />
                      Accept Order
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      onClick={() => handleAcceptOrder(false)}
                      disabled={acceptOrderMutation.isPending}
                    >
                      <X size={16} />
                      Reject Order
                    </Button>
                  </div>
                )}

                {order.status === 'ACCEPTED' && (
                  <div className="mt-6">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      disabled={updateOrderStatus.isPending}
                    >
                      <Check size={16} />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Customer Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400">
                      <User size={16} className="mr-2" />
                      <span className="text-sm">Name:</span>
                    </div>
                    <p className="text-white">{order.customerName}</p>
                  </div>

                  {order.user?.phone && (
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-400">
                        <Phone size={16} className="mr-2" />
                        <span className="text-sm">Phone:</span>
                      </div>
                      <p className="text-white">{order.user.phone}</p>
                    </div>
                  )}

                  {order.user?.email && (
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-400">
                        <Mail size={16} className="mr-2" />
                        <span className="text-sm">Email:</span>
                      </div>
                      <p className="text-white">{order.user.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Description */}
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Order Description
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Product:</p>
                      <p className="text-white">
                        {order.description || 'No description available'}
                      </p>
                    </div>

                    {order.txHash && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          Transaction:
                        </p>
                        <p className="text-white truncate">
                          {order.txHash.slice(0, 12)}...{order.txHash.slice(-8)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery and Timeline */}
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Delivery & Timeline
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Delivery Method:
                      </p>
                      <div className="flex items-center text-white">
                        <Package size={16} className="mr-2" />
                        <span>
                          {getDeliveryInfo()?.method || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {getDeliveryInfo()?.address && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          Delivery Address:
                        </p>
                        <div className="flex items-center text-white">
                          <Home size={16} className="mr-2" />
                          <span>{getDeliveryInfo()?.address}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Customer Timeline:
                      </p>
                      <div className="text-white">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2" />
                          <span className="text-sm font-medium">Start:</span>
                          <span className="ml-2">
                            {getDeliveryInfo()?.customTimeline?.startDate
                              ? `${getDeliveryInfo()?.customTimeline.startDate} at ${getDeliveryInfo()?.customTimeline.startTime || 'Not specified'}`
                              : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar size={16} className="mr-2" />
                          <span className="text-sm font-medium">End:</span>
                          <span className="ml-2">
                            {getDeliveryInfo()?.customTimeline?.endDate
                              ? `${getDeliveryInfo()?.customTimeline.endDate} at ${getDeliveryInfo()?.customTimeline.endTime || 'Not specified'}`
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurements */}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Customer Measurements
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {parseMeasurements().length > 0 ? (
                    parseMeasurements().map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-800/50 p-3 rounded-lg"
                      >
                        <p className="text-sm text-gray-400 mb-1">
                          {item.label}:
                        </p>
                        <p className="text-lg font-medium text-white">
                          {item.value}{' '}
                          <span className="text-sm text-gray-400">cm</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-gray-400 py-4 text-center">
                      No measurements provided
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-500 px-4 py-3 rounded-lg">
              <p className="font-medium">Order not found</p>
              <p className="text-sm">
                This order doesn&apos;t exist or you don&apos;t have permission
                to view it.
              </p>
            </div>
          )}

          {/* Communication */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Communication with Customer
            </h3>
            <OrderChat orderId={orderId} />
          </div>
        </div>
      </div>
    </div>
  );
}
