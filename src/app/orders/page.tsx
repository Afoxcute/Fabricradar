'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Header from '@/components/header/header';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Footer from '@/components/footer/footer';
import Link from 'next/link';
import { CustomerOrders } from '@/components/order/customer-orders';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden">
        <BackgroundEffect />
        <Header />
        
        <div className="container mx-auto p-6">
          <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Access denied</p>
              <p className="text-sm text-red-400">You need to be logged in to view your orders</p>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden">
      <BackgroundEffect />
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          {/* Using the CustomerOrders component with filtering capability */}
          <CustomerOrders 
            limit={50} 
            showSearch={true} 
            showFilters={true}
          />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Need to place a new order?</p>
          <Link href="/designs" passHref>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              Browse Designs
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 