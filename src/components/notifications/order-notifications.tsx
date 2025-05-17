'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Bell, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function OrderNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch recent order status changes
  const { data, isLoading } = api.orders.getRecentOrderChanges.useQuery(
    { userId: user?.id || 0, limit: 5 },
    { 
      enabled: Boolean(user?.id),
      refetchInterval: 60000, // Refetch every minute
    }
  );

  // Update notifications when data changes
  useEffect(() => {
    if (data?.orderChanges) {
      setNotifications(data.orderChanges);
    }
  }, [data]);

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-600';
      case 'ACCEPTED':
        return 'bg-cyan-600';
      case 'COMPLETED':
        return 'bg-green-600';
      case 'REJECTED':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown
  const closeDropdown = () => {
    setShowDropdown(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="relative flex items-center text-white hover:text-cyan-400 transition-colors p-1.5"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 shadow-lg rounded-md py-1 z-50">
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
            <h3 className="font-medium">Notifications</h3>
            <button 
              onClick={closeDropdown}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          
          {isLoading ? (
            <div className="px-4 py-3 text-center text-sm text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-gray-400">
              No new notifications
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <Link 
                  key={notification.id} 
                  href={`/orders/${notification.orderId}`}
                  className="block px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-0"
                  onClick={closeDropdown}
                >
                  <div className="flex items-start">
                    <Badge className={`${getStatusColor(notification.newStatus)} mt-1 flex-shrink-0`}>
                      {notification.newStatus}
                    </Badge>
                    <div className="ml-2">
                      <p className="text-sm">
                        Order <span className="font-medium">#{notification.orderNumber || notification.orderId}</span> status changed to <span className="font-medium">{notification.newStatus}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {getRelativeTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="border-t border-gray-700 px-4 py-2">
            <Link 
              href="/orders" 
              className="text-xs text-cyan-400 hover:text-cyan-300"
              onClick={closeDropdown}
            >
              View all orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 