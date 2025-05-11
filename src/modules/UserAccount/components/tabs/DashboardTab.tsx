'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerOrders } from '@/components/order/customer-orders';
import { CustomerRewards } from '@/components/rewards/customer-rewards';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/trpc/react';
import { RewardCard } from '@/components/rewards/reward-card';
import {
  Package,
  Award,
  CreditCard,
  User,
  Settings,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Link from 'next/link';

// Define RewardType
type RewardType = 'DISCOUNT' | 'FREE_ITEM' | 'POINTS' | 'PRIORITY';

// Define Reward interface
interface Reward {
  id: number;
  name: string;
  description: string;
  type: RewardType;
  value: number;
  minSpend?: number | null;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  imageUrl?: string | null;
  redemptionCount: number;
  maxRedemptions?: number | null;
  tailor?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
}

interface IDashboardTab {
  setActiveTab: (
    tab: 'orders' | 'profile' | 'wallet' | 'rewards' | 'dashboard'
  ) => void;
}

const DashboardTab = ({ setActiveTab }: IDashboardTab) => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'orders' | 'rewards'>(
    'orders'
  );

  // Fetch available rewards
  const { data: rewardsData } = api.rewards.getAvailableRewards.useQuery();

  // Get a few featured rewards
  const featuredRewards = React.useMemo(() => {
    if (!rewardsData?.rewards) return [];
    return rewardsData.rewards.slice(0, 2);
  }, [rewardsData]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-xl text-amber-400 mb-4">
              Authentication Required
            </p>
            <p className="text-gray-400 mb-6">
              You need to sign in to access your dashboard
            </p>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="md:text-3xl text-2xl font-bold mb-2">
          Customer Dashboard
        </h1>
        <p className="text-gray-400">
          Welcome back, {user.firstName || 'valued customer'}! Manage your
          orders and rewards.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-cyan-600/20 rounded-full flex items-center justify-center mr-4">
              <Package className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Your Orders</p>
              <button
                onClick={() => setActiveTab('orders')}
                className="md:text-xl text-lg font-semibold text-white hover:text-cyan-400 transition-colors"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Available Rewards</p>
              <button
                onClick={() => setActiveTab('rewards')}
                className="md:text-xl text-lg font-semibold text-white hover:text-purple-400 transition-colors"
              >
                Browse Rewards
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Account Settings</p>
              <button
                onClick={() => setActiveTab('profile')}
                className="md:text-xl text-lg font-semibold text-white hover:text-green-400 transition-colors"
              >
                Manage Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Rewards */}
      {featuredRewards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-400" />
            Featured Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredRewards.map((reward: Reward) => (
              <RewardCard key={reward.id} reward={reward} compact={true} />
            ))}
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveSection('orders')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeSection === 'orders'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Recent Orders
        </button>
        <button
          onClick={() => setActiveSection('rewards')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeSection === 'rewards'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Available Rewards
        </button>
      </div>

      {/* Section Content */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        {activeSection === 'orders' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="md:text-xl text-base font-semibold">
                Recent Orders
              </h2>
              <Link href="/orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-cyan-400 border-cyan-500/30"
                >
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CustomerOrders limit={3} compact={true} showFilters={false} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="md:text-xl text-base font-semibold ">
                Available Rewards
              </h2>
              <Link href="/rewards">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-cyan-400 border-cyan-500/30"
                >
                  Browse All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CustomerRewards />
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-cyan-400" />
            Fund Your Wallet
          </h3>
          <p className="text-gray-400 mb-4">
            Add funds to your wallet to easily pay for orders and receive
            discounts.
          </p>
          <Link href="/fund-wallet">
            <Button className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700">
              Fund Wallet
            </Button>
          </Link>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-cyan-400" />
            Account Settings
          </h3>
          <p className="text-gray-400 mb-4">
            Update your profile information, change preferences, and manage your
            account.
          </p>
          <Link href="/account">
            <Button
              variant="outline"
              className="w-full md:w-auto border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/20"
            >
              Manage Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
