'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import {
  DashboardTab,
  OrdersTab,
  ProfileTab,
  RewardsTab,
  WalletTab,
} from './components/tabs';
import { Sidebar } from './components';

function UserAccount() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'orders' | 'profile' | 'wallet' | 'rewards' | 'dashboard'
  >('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Sidebar state for responsiveness

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <p className="text-xl text-amber-400 mb-4">You Need to Sign In</p>
            <p className="text-gray-400 mb-6">
              Please sign in to view your account and orders
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              Go to Home Page
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <div className="w-full pl-[50px] bg-gray-800/40">
        <Header />
      </div>
      <div
        className="grid lg:grid-cols-[256px,1fr] grid-cols-1 overflow-hidden"
        style={{ height: 'calc(100vh - 66px)' }}
      >
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="w-full h-full overflow-y-auto px-5 py-4">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'rewards' && <RewardsTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'wallet' && <WalletTab />}
          {activeTab === 'dashboard' && (
            <DashboardTab setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserAccount;
