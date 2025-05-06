'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  AlertCircle, 
  Check, 
  Clock, 
  Loader2,
  User,
  ShoppingBag,
  Calendar,
  Ruler,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { JsonValue } from '@prisma/client/runtime/library';

// Define gender-specific measurement fields and labels
const maleMeasurementFields = [
  { id: 'height', label: 'Height (cm)' },
  { id: 'chest', label: 'Chest (cm)' },
  { id: 'waist', label: 'Waist (cm)' },
  { id: 'hips', label: 'Hips (cm)' },
  { id: 'shoulder', label: 'Shoulder Width (cm)' },
  { id: 'sleeve', label: 'Sleeve Length (cm)' },
  { id: 'neck', label: 'Neck (cm)' },
  { id: 'inseam', label: 'Inseam (cm)' },
];

const femaleMeasurementFields = [
  { id: 'height', label: 'Height (cm)' },
  { id: 'bust', label: 'Bust (cm)' },
  { id: 'waist', label: 'Waist (cm)' },
  { id: 'hips', label: 'Hips (cm)' },
  { id: 'shoulder', label: 'Shoulder Width (cm)' },
  { id: 'sleeve', label: 'Sleeve Length (cm)' },
  { id: 'upperArm', label: 'Upper Arm (cm)' },
  { id: 'inseam', label: 'Inseam (cm)' },
];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const orderId = parseInt(params.id);
  
  // Fetch order details
  const { data, isLoading, error } = api.orders.getOrderById.useQuery(
    { orderId },
    { 
      enabled: Boolean(orderId) && Boolean(user?.id),
      retry: 1
    }
  );
  
  // Accept/reject order mutation
  const acceptOrderMutation = api.orders.acceptOrder.useMutation({
    onSuccess: () => {
      toast.success('Order updated successfully');
      // Refetch the data
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order');
    }
  });

  const handleAcceptOrder = (accept: boolean) => {
    const action = accept ? 'accept' : 'reject';
    if (confirm(`Are you sure you want to ${action} this order?`)) {
      acceptOrderMutation.mutate({ orderId, accept });
    }
  };

  // Detect gender based on measurements
  const detectGender = (measurements: Record<string, string>) => {
    // If bust is present, likely female measurements
    if ('bust' in measurements || 'upperArm' in measurements) {
      return 'female';
    }
    // If chest is present, likely male measurements
    if ('chest' in measurements || 'neck' in measurements) {
      return 'male';
    }
    // Default to male if can't determine
    return 'male';
  };
  
  // Get appropriate measurement fields based on detected gender
  const getMeasurementFields = (measurements: Record<string, string>) => {
    const gender = detectGender(measurements);
    return gender === 'female' ? femaleMeasurementFields : maleMeasurementFields;
  };
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-600 hover:bg-green-700">Accepted</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Completed</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Access denied</p>
            <p className="text-sm text-red-400">You need to be logged in as a tailor to view this page</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 size={24} className="animate-spin text-cyan-500" />
          <span className="ml-2 text-gray-400">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading order</p>
            <p className="text-sm text-red-400">{error?.message || "Unable to load order details"}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/tailor/orders" className="text-cyan-500 hover:underline flex items-center">
            <ArrowLeft size={16} className="mr-1" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = data.order;
  const measurements = order.measurements as Record<string, string> || {};
  const measurementFields = getMeasurementFields(measurements);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/tailor/orders" className="text-cyan-500 hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Orders
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Details: {order.orderNumber}</h1>
        <div className="flex items-center">
          <span className="mr-2">Status:</span>
          {renderStatusBadge(order.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Order Info Card */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <ShoppingBag className="text-cyan-500 mr-2" />
            <h2 className="text-xl font-semibold">Order Information</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Order Number</p>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Price</p>
              <p className="font-medium text-cyan-500">${order.price.toFixed(2)} USDC</p>
            </div>
            
            {order.description && (
              <div>
                <p className="text-gray-400 text-sm">Description</p>
                <p>{order.description}</p>
              </div>
            )}
            
            <div>
              <p className="text-gray-400 text-sm">Dates</p>
              <p className="text-sm">Created: {formatDate(order.createdAt)}</p>
              {order.acceptanceDeadline && (
                <p className="text-sm text-yellow-500">
                  Acceptance Deadline: {formatDate(order.acceptanceDeadline)}
                </p>
              )}
              {order.acceptedAt && (
                <p className="text-sm text-green-500">
                  Accepted: {formatDate(order.acceptedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Customer Info Card */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <User className="text-cyan-500 mr-2" />
            <h2 className="text-xl font-semibold">Customer Information</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Customer Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            
            {order.user?.phone && (
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p>{order.user.phone}</p>
              </div>
            )}
            
            {order.user?.email && (
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p>{order.user.email}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions Card */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="text-cyan-500 mr-2" />
            <h2 className="text-xl font-semibold">Actions</h2>
          </div>
          
          {order.status === 'PENDING' && !order.isAccepted && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">This order is waiting for your response. You have 48 hours to accept or reject it.</p>
              
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  onClick={() => handleAcceptOrder(true)}
                  disabled={acceptOrderMutation.isPending}
                >
                  <Check size={16} className="mr-1" />
                  Accept Order
                </Button>
                
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  onClick={() => handleAcceptOrder(false)}
                  disabled={acceptOrderMutation.isPending}
                >
                  <AlertCircle size={16} className="mr-1" />
                  Reject Order
                </Button>
              </div>
            </div>
          )}
          
          {order.status === 'ACCEPTED' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">This order has been accepted and is in progress.</p>
              
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                onClick={() => alert('Marking as completed will be implemented soon')}
              >
                Mark as Completed
              </Button>
            </div>
          )}
          
          {(order.status === 'COMPLETED' || order.status === 'REJECTED') && (
            <p className="text-sm text-gray-400">
              This order is {order.status.toLowerCase()}. No further actions are needed.
            </p>
          )}
        </div>
      </div>
      
      {/* Measurements Card */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Ruler className="text-cyan-500 mr-2" />
          <h2 className="text-xl font-semibold">Customer Measurements</h2>
          <Badge className="ml-2 bg-gray-700">
            {detectGender(measurements) === 'male' ? 'Male' : 'Female'}
          </Badge>
        </div>
        
        {Object.keys(measurements).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {measurementFields.map(field => (
              <div key={field.id} className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">{field.label}</p>
                <p className="font-medium text-lg">
                  {measurements[field.id] || '-'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No measurement data provided for this order.</p>
        )}
      </div>
    </div>
  );
} 