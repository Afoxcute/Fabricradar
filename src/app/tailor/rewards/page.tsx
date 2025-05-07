'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  Award,
  Gift,
  Plus,
  Scissors,
  Tag,
  Trash,
  Edit,
  CheckCircle,
  Users,
  BarChart,
  Percent,
  Ticket,
  Calendar,
  Clock,
  Info,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TailorNav } from '@/components/tailor/tailor-nav';
import Image from 'next/image';
import { api } from '@/trpc/react';
import toast from 'react-hot-toast';

// Define the same RewardType as in Prisma schema
type RewardType = 'DISCOUNT' | 'FREE_ITEM' | 'POINTS' | 'PRIORITY';

// Interface for reward object
interface Reward {
  id: number;
  name: string;
  description: string;
  type: RewardType;
  value: number; // Percentage for discount, number of items for free, points value
  minSpend?: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  imageUrl?: string | null;
  redemptionCount: number;
  maxRedemptions?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  tailorId?: number;
}

export default function TailorRewardsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'expired' | 'create'>('active');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DISCOUNT' as RewardType,
    value: 0,
    minSpend: undefined as number | undefined,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default 3 months from now
    isActive: true,
    imageUrl: '',
    maxRedemptions: undefined as number | undefined,
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : undefined
      });
    } else if (type === 'date') {
      setFormData({
        ...formData,
        [name]: new Date(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle reward type selection
  const handleTypeSelect = (type: RewardType) => {
    setFormData({
      ...formData,
      type
    });
  };

  // TRPC mutations and queries
  const createRewardMutation = api.rewards.createReward.useMutation({
    onSuccess: () => {
      toast.success('Reward created successfully!');
      setActiveTab('active');
      rewardsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create reward: ${error.message}`);
    }
  });

  const updateRewardMutation = api.rewards.updateReward.useMutation({
    onSuccess: () => {
      toast.success('Reward updated successfully!');
      setSelectedReward(null);
      rewardsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update reward: ${error.message}`);
    }
  });

  const deleteRewardMutation = api.rewards.deleteReward.useMutation({
    onSuccess: () => {
      toast.success('Reward deleted successfully!');
      setSelectedReward(null);
      rewardsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete reward: ${error.message}`);
    }
  });

  // Get rewards for the current tailor
  const rewardsQuery = api.rewards.getTailorRewards.useQuery(
    {
      tailorId: user?.id ? Number(user.id) : 0,
      includeExpired: true,
      includeInactive: true
    }, 
    {
      enabled: !!user?.id,
    }
  );

  // Handle query errors
  React.useEffect(() => {
    if (rewardsQuery.error) {
      toast.error(`Failed to fetch rewards: ${rewardsQuery.error.message}`);
    }
  }, [rewardsQuery.error]);

  // Actual rewards data from the API
  const rewards: Reward[] = rewardsQuery.data?.rewards || [];

  // Function to get reward icon based on type
  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case 'DISCOUNT':
        return <Percent className="h-5 w-5 text-green-500" />;
      case 'FREE_ITEM':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'POINTS':
        return <BarChart className="h-5 w-5 text-blue-500" />;
      case 'PRIORITY':
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };
  
  // Filter rewards based on active tab
  const filteredRewards = rewards.filter((reward: Reward) => {
    if (activeTab === 'active') return reward.isActive && new Date(reward.endDate) >= new Date();
    if (activeTab === 'expired') return new Date(reward.endDate) < new Date();
    if (activeTab === 'draft') return !reward.isActive;
    return true;
  });

  // Handle reward deletion
  const handleDeleteReward = (rewardId: number) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      deleteRewardMutation.mutate({ rewardId });
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#050b18] to-[#0a1428] min-h-screen text-white pb-16">
      <div className="ml-64 pl-8 pr-8 pt-20">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Customer Rewards</h1>
            <p className="text-gray-400">Create and manage special offers and rewards for your customers</p>
          </div>
          <Button 
            onClick={() => setActiveTab('create')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Create New Reward
          </Button>
        </div>
        
        {/* Reward Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex items-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Active Rewards</p>
              <p className="text-2xl font-bold">{rewards.filter((r: Reward) => r.isActive).length}</p>
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex items-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
              <Ticket className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Redemptions</p>
              <p className="text-2xl font-bold">{rewards.reduce((sum: number, r: Reward) => sum + r.redemptionCount, 0)}</p>
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mr-4">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unique Customers</p>
              <p className="text-2xl font-bold">84</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'active' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Active Rewards
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'draft' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'expired' 
                ? 'text-cyan-400 border-b-2 border-cyan-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Expired
          </button>
        </div>
        
        {/* Create New Reward Form */}
        {activeTab === 'create' ? (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mr-3">
                <Plus className="h-5 w-5 text-cyan-500" />
              </div>
              <h2 className="text-xl font-semibold">Create New Reward</h2>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              createRewardMutation.mutate(formData);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Reward Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g. Summer Discount"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      rows={3}
                      placeholder="Describe the reward"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Reward Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`bg-gray-800 border ${formData.type === 'DISCOUNT' ? 'border-cyan-500' : 'border-gray-700'} hover:border-cyan-500 rounded-lg p-4 cursor-pointer transition-all`}
                        onClick={() => handleTypeSelect('DISCOUNT')}
                      >
                        <Percent className="h-5 w-5 text-green-500 mb-2" />
                        <h3 className="font-medium">Discount</h3>
                        <p className="text-xs text-gray-400">Percentage off orders</p>
                      </div>
                      <div 
                        className={`bg-gray-800 border ${formData.type === 'FREE_ITEM' ? 'border-cyan-500' : 'border-gray-700'} hover:border-cyan-500 rounded-lg p-4 cursor-pointer transition-all`}
                        onClick={() => handleTypeSelect('FREE_ITEM')}
                      >
                        <Gift className="h-5 w-5 text-purple-500 mb-2" />
                        <h3 className="font-medium">Free Item</h3>
                        <p className="text-xs text-gray-400">Give away items</p>
                      </div>
                      <div 
                        className={`bg-gray-800 border ${formData.type === 'POINTS' ? 'border-cyan-500' : 'border-gray-700'} hover:border-cyan-500 rounded-lg p-4 cursor-pointer transition-all`}
                        onClick={() => handleTypeSelect('POINTS')}
                      >
                        <BarChart className="h-5 w-5 text-blue-500 mb-2" />
                        <h3 className="font-medium">Loyalty Points</h3>
                        <p className="text-xs text-gray-400">Earn and redeem points</p>
                      </div>
                      <div 
                        className={`bg-gray-800 border ${formData.type === 'PRIORITY' ? 'border-cyan-500' : 'border-gray-700'} hover:border-cyan-500 rounded-lg p-4 cursor-pointer transition-all`}
                        onClick={() => handleTypeSelect('PRIORITY')}
                      >
                        <Clock className="h-5 w-5 text-amber-500 mb-2" />
                        <h3 className="font-medium">Priority Service</h3>
                        <p className="text-xs text-gray-400">Fast-track orders</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Reward Value
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="value"
                        value={formData.value || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="20"
                        required
                      />
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-700 bg-gray-700 text-gray-300">
                        {formData.type === 'DISCOUNT' ? '%' : 
                         formData.type === 'POINTS' ? 'pts' :
                         formData.type === 'FREE_ITEM' ? 'items' : 'priority'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Minimum Spend (Optional)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-700 bg-gray-700 text-gray-300">
                        $
                      </span>
                      <input
                        type="number"
                        name="minSpend"
                        value={formData.minSpend || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate.toISOString().split('T')[0]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate.toISOString().split('T')[0]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Max Redemptions (Optional)
                    </label>
                    <input
                      type="number"
                      name="maxRedemptions"
                      value={formData.maxRedemptions || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Unlimited if empty"
                    />
                  </div>
                  
                  <div className="flex justify-between gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => setActiveTab('active')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                      disabled={createRewardMutation.isPending}
                    >
                      {createRewardMutation.isPending ? 'Creating...' : 'Create Reward'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Rewards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRewards.map((reward: Reward) => (
                <div 
                  key={reward.id}
                  className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-800 transition-all"
                >
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 mr-3">
                        {getRewardIcon(reward.type)}
                      </div>
                      <h3 className="font-medium">{reward.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        new Date(reward.endDate) < new Date()
                          ? 'bg-red-900/30 text-red-400'
                          : reward.isActive 
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {new Date(reward.endDate) < new Date() 
                          ? 'Expired' 
                          : reward.isActive ? 'Active' : 'Draft'}
                      </span>
                      <button
                        onClick={() => setSelectedReward(reward)}
                        className="p-1 rounded hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-1 rounded hover:bg-gray-800"
                      >
                        <Trash className="h-4 w-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-400 mb-3">{reward.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Value</p>
                        <p className="font-medium">
                          {reward.type === 'DISCOUNT' ? `${reward.value}% off` : 
                           reward.type === 'POINTS' ? `${reward.value} points` :
                           reward.type === 'FREE_ITEM' ? `${reward.value} free items` :
                           'Priority service'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Min. Spend</p>
                        <p className="font-medium">{reward.minSpend ? `$${reward.minSpend}` : 'None'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Redemptions</p>
                        <p className="font-medium">{reward.redemptionCount}{reward.maxRedemptions ? `/${reward.maxRedemptions}` : ''}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valid Until</p>
                        <p className="font-medium">{new Date(reward.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty State */}
            {filteredRewards.length === 0 && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No rewards found</h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === 'active' ? "You don't have any active rewards. Create one to engage your customers." :
                   activeTab === 'expired' ? "No expired rewards found." :
                   "No draft rewards found."}
                </p>
                <Button
                  onClick={() => setActiveTab('create')}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Reward
                </Button>
              </div>
            )}
          </>
        )}

        {/* Edit Reward Modal */}
        {selectedReward && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Edit Reward</h2>
                <button
                  onClick={() => setSelectedReward(null)}
                  className="text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                updateRewardMutation.mutate({
                  rewardId: selectedReward.id,
                  name: selectedReward.name,
                  description: selectedReward.description,
                  type: selectedReward.type,
                  value: selectedReward.value,
                  minSpend: selectedReward.minSpend,
                  startDate: new Date(selectedReward.startDate),
                  endDate: new Date(selectedReward.endDate),
                  isActive: selectedReward.isActive,
                  imageUrl: selectedReward.imageUrl,
                  maxRedemptions: selectedReward.maxRedemptions
                });
              }}>
                {/* Edit form fields similar to create form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Reward Name
                      </label>
                      <input
                        type="text"
                        value={selectedReward.name}
                        onChange={(e) => setSelectedReward({...selectedReward, name: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={selectedReward.description}
                        onChange={(e) => setSelectedReward({...selectedReward, description: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Active Status
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={selectedReward.isActive}
                          onChange={(e) => setSelectedReward({...selectedReward, isActive: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-300">
                          Reward is active and visible to customers
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Reward Value
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          value={selectedReward.value}
                          onChange={(e) => setSelectedReward({...selectedReward, value: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                        <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-700 bg-gray-700 text-gray-300">
                          {selectedReward.type === 'DISCOUNT' ? '%' : 
                           selectedReward.type === 'POINTS' ? 'pts' :
                           selectedReward.type === 'FREE_ITEM' ? 'items' : 'priority'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Minimum Spend
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-700 bg-gray-700 text-gray-300">
                          $
                        </span>
                        <input
                          type="number"
                          value={selectedReward.minSpend || ''}
                          onChange={(e) => setSelectedReward({
                            ...selectedReward, 
                            minSpend: e.target.value ? parseFloat(e.target.value) : undefined
                          })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="No minimum"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={new Date(selectedReward.startDate).toISOString().split('T')[0]}
                          onChange={(e) => setSelectedReward({
                            ...selectedReward,
                            startDate: new Date(e.target.value)
                          })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={new Date(selectedReward.endDate).toISOString().split('T')[0]}
                          onChange={(e) => setSelectedReward({
                            ...selectedReward,
                            endDate: new Date(e.target.value)
                          })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => setSelectedReward(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    disabled={updateRewardMutation.isPending}
                  >
                    {updateRewardMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <TailorNav />
    </div>
  );
} 