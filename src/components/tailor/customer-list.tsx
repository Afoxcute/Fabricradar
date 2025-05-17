'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  CircleDollarSign,
  Coins,
  Loader2,
  RefreshCw, 
  ChevronRight, 
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { TokenTransferDialog } from './token-transfer-dialog';

interface Customer {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  _count: {
    orders: number;
  };
  orders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    price: number;
    createdAt: Date;
    designId: number | null;
  }>;
}

export const CustomerList = () => {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // Fetch customers data
  const { 
    data, 
    isLoading, 
    refetch 
  } = api.users.getTailorCustomers.useQuery(
    { tailorId: user?.id || 0 },
    { enabled: !!user?.id && user?.accountType === 'TAILOR' }
  );

  // Filter customers based on search term
  const filteredCustomers = data?.customers?.filter(customer => {
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim().toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const phone = (customer.phone || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchLower) || 
      email.includes(searchLower) || 
      phone.includes(searchLower)
    );
  }) || [];

  // Handle customer selection for token sending
  const toggleCustomerSelection = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  // View customer details
  const viewCustomerDetails = (customer: Customer) => {
    setCustomerDetails(customer);
    setShowCustomerDetails(true);
  };

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-cyan-600">Accepted</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-600">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Get customer full name
  const getCustomerName = (customer: Customer) => {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Anonymous';
  };

  // Get selected customers data
  const getSelectedCustomersData = () => {
    return filteredCustomers.filter(customer => selectedCustomers.includes(customer.id));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
          
          {selectedCustomers.length > 0 && (
            <Button
              size="sm"
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700"
              onClick={() => setShowTokenDialog(true)}
            >
              <Send size={14} />
              Send Tokens ({selectedCustomers.length})
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search customers by name, email, or phone..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={24} className="animate-spin text-cyan-500" />
          <span className="ml-2 text-gray-400">Loading customers...</span>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
          <Coins className="h-12 w-12 mx-auto text-gray-600 mb-3" />
          <h3 className="text-lg font-medium mb-2">No customers found</h3>
          <p className="text-gray-400">
            {searchTerm 
              ? "No customers match your search. Try different search terms."
              : "You don't have any customers yet. They'll appear here when people order from you."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableCaption>
              Showing {filteredCustomers.length} customers
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === filteredCustomers.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                // Calculate total spent
                const totalSpent = customer.orders.reduce((sum, order) => sum + order.price, 0);
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => toggleCustomerSelection(customer.id)}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-800"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getCustomerName(customer)}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.email && (
                        <div className="flex items-center text-sm">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center text-sm mt-1">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-gray-700">
                        {customer._count.orders}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <CircleDollarSign size={14} className="mr-1 text-green-500" />
                        <span className="font-medium">${totalSpent.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewCustomerDetails(customer)}
                        className="flex items-center gap-1"
                      >
                        View <ChevronRight size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View detailed information about this customer.
            </DialogDescription>
          </DialogHeader>
          
          {customerDetails && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Contact Information</h3>
                  <p className="text-xl font-bold">
                    {getCustomerName(customerDetails)}
                  </p>
                  {customerDetails.email && (
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <span>{customerDetails.email}</span>
                    </div>
                  )}
                  {customerDetails.phone && (
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      <span>{customerDetails.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400">Order Summary</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Orders:</span>
                    <Badge variant="outline" className="border-gray-700 text-white">
                      {customerDetails._count.orders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Spent:</span>
                    <div className="flex items-center">
                      <CircleDollarSign size={14} className="mr-1 text-green-500" />
                      <span className="font-medium">
                        ${customerDetails.orders.reduce((sum, order) => sum + order.price, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Customer Since:</span>
                    <span>{formatDate(customerDetails.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">Recent Orders</h3>
                {customerDetails.orders.length > 0 ? (
                  <div className="rounded-md border border-gray-800">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerDetails.orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>${order.price.toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-right">
                              <Link href={`/tailor/orders/${order.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  View <ChevronRight size={14} />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-900/30 rounded-xl border border-gray-800">
                    <p className="text-gray-400">No orders found for this customer.</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCustomerDetails(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => {
                    setSelectedCustomers([customerDetails.id]);
                    setShowCustomerDetails(false);
                    setShowTokenDialog(true);
                  }}
                >
                  <Send size={14} />
                  Send Tokens
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Token Transfer Dialog */}
      {showTokenDialog && (
        <TokenTransferDialog
          open={showTokenDialog}
          onClose={() => setShowTokenDialog(false)}
          selectedCustomers={getSelectedCustomersData()}
        />
      )}
    </div>
  );
}; 