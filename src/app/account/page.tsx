'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, User, CreditCard, Clock, Settings, LogOut } from 'lucide-react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wallet'>('orders');
  
  // Fetch user's orders
  const { data: ordersData, isLoading: isLoadingOrders } = api.orders.getCustomerOrders.useQuery(
    { userId: user?.id || 0, limit: 10 },
    { enabled: Boolean(user?.id) }
  );
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <p className="text-xl text-amber-400 mb-4">You Need to Sign In</p>
            <p className="text-gray-400 mb-6">Please sign in to view your account and orders</p>
            <Button onClick={() => router.push('/')}>Go to Home Page</Button>
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : 'Your Account'}
                  </h2>
                  <p className="text-sm text-gray-400">{user.accountType}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-cyan-600/20 text-cyan-400' 
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>My Orders</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-cyan-600/20 text-cyan-400' 
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                    activeTab === 'wallet' 
                      ? 'bg-cyan-600/20 text-cyan-400' 
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Wallet</span>
                </button>
                
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 p-2 rounded-md text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">My Orders</h1>
                </div>
                
                {isLoadingOrders ? (
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center">
                    <Clock className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-2" />
                    <p className="text-gray-400">Loading your orders...</p>
                  </div>
                ) : !ordersData?.orders?.length ? (
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center">
                    <Package className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 mb-4">You don&apos;t have any orders yet.</p>
                    <Link href="/">
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersData.orders.map((order) => (
                      <Link key={order.id} href={`/orders/${order.id}`}>
                        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/60 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-lg">{order.orderNumber}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              {order.description && (
                                <p className="text-gray-300 mt-2 line-clamp-1">{order.description}</p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold text-lg">${order.price.toFixed(2)}</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                order.status === 'COMPLETED' ? 'bg-green-900/50 text-green-400' :
                                order.status === 'ACCEPTED' ? 'bg-cyan-900/50 text-cyan-400' :
                                order.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400' :
                                'bg-red-900/50 text-red-400'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {ordersData.nextCursor && (
                      <div className="text-center pt-4">
                        <Button variant="outline">Load More Orders</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">My Profile</h1>
                
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-gray-400 text-sm">First Name</h3>
                      <p className="font-medium">{user.firstName || '(Not provided)'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 text-sm">Last Name</h3>
                      <p className="font-medium">{user.lastName || '(Not provided)'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 text-sm">Email</h3>
                      <p className="font-medium">{user.email || '(Not provided)'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-400 text-sm">Phone</h3>
                      <p className="font-medium">{user.phone || '(Not provided)'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">My Wallet</h1>
                
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Wallet Address</h2>
                  
                  {user.walletAddress ? (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Connected Wallet:</p>
                      <p className="font-mono bg-gray-900 p-3 rounded-md overflow-auto">
                        {user.walletAddress}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <CreditCard className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 mb-4">No wallet connected</p>
                      <Button>Connect Wallet</Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
