'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import {
  Award,
  Gift,
  Percent,
  BarChart,
  Clock,
  Search,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RewardCard } from './reward-card';
import { GiftAnimation } from '../GiftAnimation/GiftAnimation';

// Define the RewardType to match the API
type RewardType = 'DISCOUNT' | 'FREE_ITEM' | 'POINTS' | 'PRIORITY';

interface Reward {
  id: number;
  name: string;
  description: string;
  type: RewardType;
  value: number;
  minSpend?: number | null;
  startDate: Date;
  endDate: Date;
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

export function CustomerRewards() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<RewardType | 'ALL'>('ALL');
  const [showNewRewardAnimation, setShowNewRewardAnimation] = useState(false);

  // Fetch available rewards
  const { data, isLoading, refetch } =
    api.rewards.getAvailableRewards.useQuery();

  // Get rewards from data if available
  const rewards: Reward[] = data?.rewards || [];

  // Check for new rewards (this is a simulation - in a real app, you'd compare with previously seen rewards)
  useEffect(() => {
    // This is just a demo - in a real app, you'd check if there are new rewards since last visit
    const hasNewRewards = rewards.length > 0 && Math.random() > 0.7;

    if (hasNewRewards) {
      // Show the gift animation for new rewards
      const timer = setTimeout(() => {
        setShowNewRewardAnimation(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [rewards]);

  // Filter rewards based on search term and selected type
  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || reward.type === selectedType;

    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={24} className="animate-spin text-cyan-500" />
        <span className="ml-2 text-gray-400">Loading rewards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gift animation for new rewards */}
      <GiftAnimation
        show={showNewRewardAnimation}
        onComplete={() => setShowNewRewardAnimation(false)}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Available Rewards</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rewards..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant={selectedType === 'ALL' ? 'default' : 'outline'}
              onClick={() => setSelectedType('ALL')}
              className={
                selectedType === 'ALL' ? 'bg-cyan-600 hover:bg-cyan-700' : ''
              }
            >
              All
            </Button>
            <Button
              size="sm"
              variant={selectedType === 'DISCOUNT' ? 'default' : 'outline'}
              onClick={() => setSelectedType('DISCOUNT')}
              className={
                selectedType === 'DISCOUNT'
                  ? 'bg-green-600 hover:bg-green-700'
                  : ''
              }
            >
              <Percent className="h-4 w-4 mr-1" />
              Discounts
            </Button>
            <Button
              size="sm"
              variant={selectedType === 'FREE_ITEM' ? 'default' : 'outline'}
              onClick={() => setSelectedType('FREE_ITEM')}
              className={
                selectedType === 'FREE_ITEM'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : ''
              }
            >
              <Gift className="h-4 w-4 mr-1" />
              Free Items
            </Button>
            <Button
              size="sm"
              variant={selectedType === 'POINTS' ? 'default' : 'outline'}
              onClick={() => setSelectedType('POINTS')}
              className={
                selectedType === 'POINTS' ? 'bg-blue-600 hover:bg-blue-700' : ''
              }
            >
              <BarChart className="h-4 w-4 mr-1" />
              Points
            </Button>
            <Button
              size="sm"
              variant={selectedType === 'PRIORITY' ? 'default' : 'outline'}
              onClick={() => setSelectedType('PRIORITY')}
              className={
                selectedType === 'PRIORITY'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : ''
              }
            >
              <Clock className="h-4 w-4 mr-1" />
              Priority
            </Button>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      {filteredRewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-8 text-center">
          <Award className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No rewards found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedType !== 'ALL'
              ? 'No rewards match your current filters. Try adjusting your search.'
              : 'There are no active rewards available at the moment. Check back later!'}
          </p>
        </div>
      )}
    </div>
  );
}
