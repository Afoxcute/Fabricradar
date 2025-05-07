'use client';

import React, { useState } from 'react';
import { Gift, Plus, Sparkles, Star, Trash2, Edit, Award, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import Image from 'next/image';

// Define Reward interface
interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  type: 'discount' | 'freeItem' | 'exclusiveDesign';
  active: boolean;
}

export default function RewardsTab() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: '15% Off Next Order',
      description: 'Get 15% off your next custom tailoring order',
      pointsRequired: 500,
      type: 'discount',
      active: true,
    },
    {
      id: '2',
      title: 'Free Alteration',
      description: 'Get one free alteration on any previous order',
      pointsRequired: 750,
      type: 'freeItem',
      active: true,
    },
    {
      id: '3',
      title: 'VIP Design Consultation',
      description: 'Exclusive 30-minute design consultation with a master tailor',
      pointsRequired: 1500,
      type: 'exclusiveDesign',
      active: false,
    },
  ]);
  
  const [newReward, setNewReward] = useState<Omit<Reward, 'id'>>({
    title: '',
    description: '',
    pointsRequired: 500,
    type: 'discount',
    active: true,
  });

  // If user is not a tailor, show customer view
  if (user?.accountType !== 'TAILOR') {
    return <CustomerRewardsView />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReward({
      ...newReward,
      [name]: name === 'pointsRequired' ? parseInt(value) : value,
    });
  };

  const handleCreateReward = () => {
    // In a real app, you would send this to your API
    const newRewardWithId = {
      ...newReward,
      id: Math.random().toString(36).substring(2, 11),
    };
    
    setRewards([...rewards, newRewardWithId]);
    setNewReward({
      title: '',
      description: '',
      pointsRequired: 500,
      type: 'discount',
      active: true,
    });
    setShowCreateForm(false);
  };

  const toggleRewardStatus = (id: string) => {
    setRewards(
      rewards.map((reward) =>
        reward.id === id ? { ...reward, active: !reward.active } : reward
      )
    );
  };

  const deleteReward = (id: string) => {
    setRewards(rewards.filter((reward) => reward.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <Gift className="mr-2 h-6 w-6 text-cyan-400" />
          Customer Rewards
        </h1>
        
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          {showCreateForm ? 'Cancel' : (
            <>
              <Plus className="mr-1 h-4 w-4" /> 
              Create Reward
            </>
          )}
        </Button>
      </div>
      
      <div className="relative">
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-8 backdrop-blur-sm border border-cyan-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Reward Your Loyal Customers</h2>
              <p className="text-gray-300 mb-4">
                Create exclusive rewards that customers can redeem with loyalty points earned from their purchases.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-cyan-500/20 rounded-full px-3 py-1 text-xs text-cyan-300 flex items-center">
                  <Sparkles className="mr-1 h-3 w-3" /> Increase Retention
                </div>
                <div className="bg-purple-500/20 rounded-full px-3 py-1 text-xs text-purple-300 flex items-center">
                  <Star className="mr-1 h-3 w-3" /> Build Loyalty
                </div>
                <div className="bg-amber-500/20 rounded-full px-3 py-1 text-xs text-amber-300 flex items-center">
                  <Award className="mr-1 h-3 w-3" /> Drive Sales
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative h-40 w-40 md:h-48 md:w-48">
                <Image 
                  src="/rewards-illustration.svg" 
                  alt="Rewards Illustration" 
                  width={200} 
                  height={200}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showCreateForm && (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Plus className="mr-2 h-5 w-5 text-cyan-400" />
            Create New Reward
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Reward Title</label>
              <input
                type="text"
                name="title"
                value={newReward.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700/60 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 10% Off Next Order"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea
                name="description"
                value={newReward.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700/60 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Explain what the customer gets with this reward"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Points Required</label>
                <input
                  type="number"
                  name="pointsRequired"
                  value={newReward.pointsRequired}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700/60 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Reward Type</label>
                <select
                  name="type"
                  value={newReward.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700/60 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="discount">Discount</option>
                  <option value="freeItem">Free Item/Service</option>
                  <option value="exclusiveDesign">Exclusive Design</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="border-gray-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateReward}
                disabled={!newReward.title || !newReward.description}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Create Reward
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Rewards ({rewards.length})</h2>
        
        {rewards.length === 0 ? (
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center">
            <Gift className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-3">You haven&apos;t created any rewards yet.</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create Your First Reward
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div 
                key={reward.id} 
                className={`bg-gray-800/60 backdrop-blur-sm rounded-xl border ${
                  reward.active ? 'border-cyan-800/50' : 'border-gray-700/50 opacity-75'
                } p-5 relative overflow-hidden`}
              >
                {/* Reward Icon */}
                <div className="absolute -right-4 -top-4 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 h-24 w-24 rounded-full flex items-center justify-center">
                  {reward.type === 'discount' && <Sparkles className="h-8 w-8 text-cyan-400/30" />}
                  {reward.type === 'freeItem' && <Gift className="h-8 w-8 text-purple-400/30" />}
                  {reward.type === 'exclusiveDesign' && <Star className="h-8 w-8 text-amber-400/30" />}
                </div>
                
                {/* Badge */}
                <span className={`inline-block text-xs rounded-full px-2 py-0.5 ${
                  reward.type === 'discount' ? 'bg-cyan-900/50 text-cyan-400' :
                  reward.type === 'freeItem' ? 'bg-purple-900/50 text-purple-400' :
                  'bg-amber-900/50 text-amber-400'
                }`}>
                  {reward.type === 'discount' ? 'Discount' : 
                   reward.type === 'freeItem' ? 'Free Item' : 'Exclusive Design'}
                </span>
                
                <h3 className="text-lg font-semibold mt-2 mr-16">{reward.title}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {reward.description}
                </p>
                
                <div className="mt-3 flex items-center">
                  <Award className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-amber-400 font-semibold">{reward.pointsRequired} points</span>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => deleteReward(reward.id)} 
                      className="p-1 text-gray-400 hover:text-red-400"
                      title="Delete Reward"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-cyan-400"
                      title="Edit Reward"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => toggleRewardStatus(reward.id)}
                    className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                      reward.active 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-gray-700/60 text-gray-400'
                    }`}
                  >
                    {reward.active ? (
                      <>
                        <Check className="h-3 w-3" /> Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" /> Inactive
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Customer view of rewards
function CustomerRewardsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <Gift className="mr-2 h-6 w-6 text-cyan-400" /> 
          My Rewards
        </h1>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl p-8 backdrop-blur-sm border border-purple-500/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Earn Rewards with Every Purchase</h2>
            <p className="text-gray-300 mb-4">
              Get exclusive rewards and discounts by shopping with your favorite tailors. Earn points with every order!
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Your Points</span>
                <span className="text-xs text-cyan-300">View History</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold text-amber-400">250</span>
                <span className="text-sm text-gray-400">points</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative h-48 w-48">
              <Image 
                src="/customer-rewards.svg" 
                alt="Rewards Illustration" 
                width={200} 
                height={200}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold">Available Rewards</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            id: '1',
            title: '15% Off Next Order',
            description: 'Get 15% off your next custom tailoring order',
            pointsRequired: 500,
            tailor: 'Elegant Stitches',
            type: 'discount',
          },
          {
            id: '2',
            title: 'Free Alteration',
            description: 'Get one free alteration on any previous order',
            pointsRequired: 750,
            tailor: 'FashionFix Tailors',
            type: 'freeItem',
          },
          {
            id: '3',
            title: 'VIP Design Consultation',
            description: 'Exclusive 30-minute design consultation with a master tailor',
            pointsRequired: 1500,
            tailor: 'Couture Masters',
            type: 'exclusiveDesign',
          },
        ].map((reward) => (
          <div 
            key={reward.id} 
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-5 relative overflow-hidden hover:border-cyan-700 transition-colors"
          >
            {/* Reward Icon */}
            <div className="absolute -right-4 -top-4 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 h-24 w-24 rounded-full flex items-center justify-center">
              {reward.type === 'discount' && <Sparkles className="h-8 w-8 text-cyan-400/30" />}
              {reward.type === 'freeItem' && <Gift className="h-8 w-8 text-purple-400/30" />}
              {reward.type === 'exclusiveDesign' && <Star className="h-8 w-8 text-amber-400/30" />}
            </div>
            
            {/* Badge */}
            <span className={`inline-block text-xs rounded-full px-2 py-0.5 ${
              reward.type === 'discount' ? 'bg-cyan-900/50 text-cyan-400' :
              reward.type === 'freeItem' ? 'bg-purple-900/50 text-purple-400' :
              'bg-amber-900/50 text-amber-400'
            }`}>
              {reward.type === 'discount' ? 'Discount' : 
               reward.type === 'freeItem' ? 'Free Item' : 'Exclusive Design'}
            </span>
            
            <h3 className="text-lg font-semibold mt-2 mr-16">{reward.title}</h3>
            <p className="text-gray-400 text-sm mt-1">
              {reward.description}
            </p>
            
            <p className="text-xs text-gray-500 mt-1">
              Offered by {reward.tailor}
            </p>
            
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex items-center">
                <Award className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-amber-400 font-semibold">{reward.pointsRequired} points</span>
              </div>
              
              <Button
                disabled={250 < reward.pointsRequired}
                className={`px-3 py-1 text-xs ${
                  250 >= reward.pointsRequired 
                    ? 'bg-cyan-600 hover:bg-cyan-700' 
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
              >
                {250 >= reward.pointsRequired ? 'Redeem' : 'Not Enough Points'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 