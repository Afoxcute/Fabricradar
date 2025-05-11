'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Search,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Define JSON value types for Prisma compatibility
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [Key in string]?: JsonValue };
type JsonArray = JsonValue[];

// Define Order interface with proper types
interface Order {
  id: number;
  orderNumber: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  customerName: string;
  userId: number;
  tailorId: number;
  status: string;
  price: number;
  txHash: string | null;
  description: string | null;
  measurements?: JsonValue | null;
  designId?: number | null;
  isAccepted: boolean;
  acceptanceDeadline?: Date | string | null;
  acceptedAt?: Date | string | null;
}

interface CustomerOrdersProps {
  limit?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}

export function CustomerOrders({
  limit = 10,
  showSearch = true,
  showFilters = true,
  compact = false,
}: CustomerOrdersProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch user's orders
  const { data, isLoading, refetch } = api.orders.getCustomerOrders.useQuery(
    { userId: user?.id || 0, limit },
    { enabled: Boolean(user?.id) }
  );

  // Filter orders based on search term and status filter
  const filteredOrders = React.useMemo(() => {
    if (!data?.orders) return [];

    return data.orders.filter((order: Order) => {
      const matchesSearch =
        searchTerm === '' ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.description &&
          order.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === null || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data?.orders, searchTerm, statusFilter]);

  // Status badge component for consistent styling
  const StatusBadge = ({ status }: { status: string }) => {
    let color;
    let icon;
    let label;

    switch (status) {
      case 'PENDING':
        color = 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40';
        icon = <Clock className="h-3 w-3 mr-1" />;
        label = 'Pending';
        break;
      case 'ACCEPTED':
        color = 'bg-cyan-600/20 text-cyan-400 border-cyan-600/40';
        icon = <Clock className="h-3 w-3 mr-1" />;
        label = 'In Progress';
        break;
      case 'COMPLETED':
        color = 'bg-green-600/20 text-green-400 border-green-600/40';
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        label = 'Completed';
        break;
      case 'REJECTED':
        color = 'bg-red-600/20 text-red-400 border-red-600/40';
        icon = <XCircle className="h-3 w-3 mr-1" />;
        label = 'Rejected';
        break;
      default:
        color = 'bg-gray-600/20 text-gray-400 border-gray-600/40';
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        label = status;
    }

    return (
      <Badge variant="outline" className={`${color} flex items-center`}>
        {icon}
        {label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center">
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
        <p className="text-amber-400 font-medium mb-2">
          Authentication Required
        </p>
        <p className="text-gray-400 mb-4">Please sign in to view your orders</p>
        <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={24} className="animate-spin text-cyan-500" />
        <span className="ml-2 text-gray-400">Loading your orders...</span>
      </div>
    );
  }

  // Format date to a readable format
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {(showSearch || showFilters) && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          {/* Search */}
          {showSearch && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Status Filter */}
          {showFilters && (
            <div className="flex space-x-2 overflow-x-auto pb-1 w-full">
              <Button
                size="sm"
                variant={statusFilter === null ? 'default' : 'outline'}
                onClick={() => setStatusFilter(null)}
                className={
                  statusFilter === null ? 'bg-cyan-600 hover:bg-cyan-700' : ''
                }
              >
                All
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
                className={
                  statusFilter === 'PENDING'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : ''
                }
              >
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('ACCEPTED')}
                className={
                  statusFilter === 'ACCEPTED'
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : ''
                }
              >
                <Clock className="h-4 w-4 mr-1" />
                In Progress
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('COMPLETED')}
                className={
                  statusFilter === 'COMPLETED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('REJECTED')}
                className={
                  statusFilter === 'REJECTED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : ''
                }
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejected
              </Button>
            </div>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-gray-400 border-gray-700 hover:bg-gray-800 md:ml-auto flex-shrink-0"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      )}

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 text-center">
          <Package className="h-10 w-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || statusFilter
              ? 'No orders match your current filters. Try adjusting your search or filter criteria.'
              : "You haven't placed any orders yet."}
          </p>
          <Button
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => router.push('/')}
          >
            Browse Designs
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => (
            <div
              key={order.id}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-2 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {order.orderNumber}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(order.createdAt)}
                      </div>

                      <div className="hidden md:block">•</div>

                      <div>${order.price.toFixed(2)}</div>
                    </div>

                    {order.description && !compact && (
                      <p className="text-sm text-gray-300 mt-2 max-w-3xl line-clamp-1 md:line-clamp-2">
                        {order.description}
                      </p>
                    )}
                  </div>

                  <Link href={`/orders/${order.id}`}>
                    <Button className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 flex items-center gap-1">
                      <span>{compact ? 'Details' : 'View Details'}</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {data?.nextCursor && !compact && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                onClick={() => router.push('/orders')}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/20"
              >
                View All Orders
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
