'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { OrderProgressTracker } from '@/components/order-progress/order-progress-tracker';
import { OrderChat } from '@/components/order-chat/order-chat';
import { Button } from '@/components/ui/button';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import BackgroundEffect from '@/components/background-effect/background-effect';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = parseInt(params.id as string, 10);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'chat'>('details');
  
  // Fetch order data
  const { data: orderData, isLoading } = api.orders.getOrderById.useQuery(
    { orderId },
    { enabled: Boolean(orderId) && Boolean(user?.id) }
  );
  
  // Determine if current user is the tailor for this order
  const isTailor = user?.accountType === 'TAILOR' && orderData?.tailorId === user.id;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mb-4" />
          <p className="text-gray-400">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <p className="text-xl text-red-400 mb-4">Order Not Found</p>
            <p className="text-gray-400 mb-6">The order you are looking for does not exist or you don&apos;t have permission to view it.</p>
            <Link href="/account">
              <Button>Go to My Account</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back navigation and order info */}
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Account</span>
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <Package className="mr-3 h-6 w-6 text-cyan-500" />
            Order #{orderData.orderNumber}
          </h1>
          
          <div className="mt-2 flex flex-wrap gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-gray-400 text-sm">Status:</span>
              <span className={`ml-2 font-medium ${
                orderData.status === 'COMPLETED' ? 'text-green-400' :
                orderData.status === 'ACCEPTED' ? 'text-cyan-400' :
                orderData.status === 'PENDING' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {orderData.status}
              </span>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-gray-400 text-sm">Price:</span>
              <span className="ml-2 font-medium">${orderData.price.toFixed(2)}</span>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-gray-400 text-sm">Date:</span>
              <span className="ml-2 font-medium">
                {new Date(orderData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-1 ${
                activeTab === 'details'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`pb-3 px-1 ${
                activeTab === 'progress'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Progress Tracker
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-3 px-1 ${
                activeTab === 'chat'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Communication
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="mb-12">
          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Order Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-400 text-sm">Order Number</h3>
                    <p className="font-medium">{orderData.orderNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-400 text-sm">Customer Name</h3>
                    <p className="font-medium">{orderData.customerName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-400 text-sm">Status</h3>
                    <p className={`font-medium ${
                      orderData.status === 'COMPLETED' ? 'text-green-400' :
                      orderData.status === 'ACCEPTED' ? 'text-cyan-400' :
                      orderData.status === 'PENDING' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {orderData.status}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-400 text-sm">Order Date</h3>
                    <p className="font-medium">
                      {new Date(orderData.createdAt).toLocaleDateString()} at {new Date(orderData.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {orderData.acceptedAt && (
                    <div>
                      <h3 className="text-gray-400 text-sm">Accepted On</h3>
                      <p className="font-medium">
                        {new Date(orderData.acceptedAt).toLocaleDateString()} at {new Date(orderData.acceptedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Design and Payment</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-400 text-sm">Price</h3>
                    <p className="font-medium">${orderData.price.toFixed(2)}</p>
                  </div>
                  
                  {orderData.txHash && (
                    <div>
                      <h3 className="text-gray-400 text-sm">Transaction Hash</h3>
                      <p className="font-mono text-sm text-cyan-400 break-all">
                        {orderData.txHash}
                      </p>
                    </div>
                  )}
                  
                  {orderData.description && (
                    <div>
                      <h3 className="text-gray-400 text-sm">Description</h3>
                      <p className="font-medium">{orderData.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Measurements */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-white">Measurements</h2>
                
                {orderData.measurements ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(orderData.measurements as Record<string, string>).map(([key, value]) => (
                      <div key={key}>
                        <h3 className="text-gray-400 text-sm capitalize">{key.replace(/_/g, ' ')}</h3>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No measurement data available.</p>
                )}
              </div>
            </div>
          )}
          
          {/* Progress Tracker Tab */}
          {activeTab === 'progress' && (
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">Order Progress</h2>
              <OrderProgressTracker 
                orderId={orderId} 
                status={orderData.status} 
                isTailor={isTailor}
              />
            </div>
          )}
          
          {/* Communication Tab */}
          {activeTab === 'chat' && (
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">Communication</h2>
              <OrderChat orderId={orderId} isTailor={isTailor} />
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 