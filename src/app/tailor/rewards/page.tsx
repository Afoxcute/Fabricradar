'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TailorNav } from '@/components/tailor/tailor-nav';
import Header from '@/components/header/header';
import BackgroundEffect from '@/components/background-effect/background-effect';
import { useAuth } from '@/providers/auth-provider';
import { 
  Award, 
  Gift, 
  Sparkles, 
  PlusCircle, 
  Save, 
  Trash2, 
  Edit2, 
  FileText, 
  Percent,
  Calendar,
  Users,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import toast from 'react-hot-toast';
import Footer from '@/components/footer/footer';
import { TailorWalletHelper } from '@/components/tailor/tailor-wallet-helper';
import { RewardIllustration } from '@/components/tailor/reward-illustration';

export default function TailorRewardsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [showNewRewardForm, setShowNewRewardForm] = useState(false);

  // Dummy rewards data
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "10% Off Next Order",
      description: "Get 10% off your next custom order with us!",
      type: "discount",
      value: 10,
      expiresIn: 30,
      pointsRequired: 100,
      isActive: true,
      createdAt: new Date("2023-10-10")
    },
    {
      id: 2,
      name: "Free Fabric Upgrade",
      description: "Upgrade to premium fabric at no extra cost",
      type: "freebie",
      value: 0,
      expiresIn: 60,
      pointsRequired: 250,
      isActive: true,
      createdAt: new Date("2023-11-05")
    },
    {
      id: 3,
      name: "Priority Tailoring",
      description: "Skip the queue! Get your order prioritized.",
      type: "service",
      value: 0,
      expiresIn: 90,
      pointsRequired: 300,
      isActive: false,
      createdAt: new Date("2023-09-15")
    }
  ]);

  // Define a type for the reward object
  type Reward = {
    id: number;
    name: string;
    description: string;
    type: string;
    value: number;
    expiresIn: number;
    pointsRequired: number;
    isActive: boolean;
    createdAt?: Date;
  };

  // New reward form state
  const [newReward, setNewReward] = useState<Omit<Reward, 'id' | 'createdAt'>>({
    name: "",
    description: "",
    type: "discount",
    value: 0,
    expiresIn: 30,
    pointsRequired: 100,
    isActive: true
  });

  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Animation variants for the cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  // Handle reward creation
  const handleCreateReward = () => {
    const newId = Math.max(0, ...rewards.map(r => r.id)) + 1;
    const createdReward = {
      ...newReward,
      id: newId,
      createdAt: new Date()
    };
    
    setRewards([...rewards, createdReward]);
    setNewReward({
      name: "",
      description: "",
      type: "discount",
      value: 0,
      expiresIn: 30,
      pointsRequired: 100,
      isActive: true
    });
    setShowNewRewardForm(false);
    toast.success('Reward created successfully!');
  };

  // Handle reward updates
  const handleUpdateReward = (id: number) => {
    if (!editingReward) return;
    
    const updatedRewards = rewards.map(reward => 
      reward.id === id ? {...editingReward} : reward
    );
    setRewards(updatedRewards);
    setEditingReward(null);
    toast.success('Reward updated successfully!');
  };

  // Handle reward deletion
  const handleDeleteReward = (id: number) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      const filteredRewards = rewards.filter(reward => reward.id !== id);
      setRewards(filteredRewards);
      toast.success('Reward deleted successfully!');
    }
  };

  // Handle reward toggling
  const handleToggleReward = (id: number) => {
    const updatedRewards = rewards.map(reward => 
      reward.id === id ? {...reward, isActive: !reward.isActive} : reward
    );
    setRewards(updatedRewards);
    const targetReward = rewards.find(r => r.id === id);
    if (targetReward) {
      toast.success(`Reward ${!targetReward.isActive ? 'activated' : 'deactivated'} successfully!`);
    }
  };

  // Get reward icon based on type
  const getRewardIcon = (type: string) => {
    switch(type) {
      case 'discount':
        return <Percent className="h-8 w-8 text-blue-500" />;
      case 'freebie':
        return <Gift className="h-8 w-8 text-purple-500" />;
      case 'service':
        return <Award className="h-8 w-8 text-amber-500" />;
      default:
        return <Gift className="h-8 w-8 text-blue-500" />;
    }
  };

  // Filter rewards based on active tab
  const filteredRewards = rewards.filter(reward => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return reward.isActive;
    if (activeTab === 'inactive') return !reward.isActive;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="flex">
        <TailorNav />
        
        <div className="ml-64 flex-1 p-8 relative z-10 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <motion.h1 
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="flex items-center">
                  <Sparkles className="h-7 w-7 text-yellow-400 mr-3" /> 
                  Customer Rewards
                </span>
              </motion.h1>
              <motion.p 
                className="text-gray-400 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Create and manage special rewards for your loyal customers
              </motion.p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <TailorWalletHelper variant="outline" className="md:mr-2" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
                  onClick={() => setShowNewRewardForm(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create New Reward</span>
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Animated Illustration */}
          {!showNewRewardForm && rewards.length === 0 && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <RewardIllustration />
            </motion.div>
          )}
          
          {/* Summary Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-sm border border-blue-800/50 rounded-xl p-6"
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 255, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-700/30 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm">Total Rewards</h3>
                  <p className="text-2xl font-bold text-white">{rewards.length}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-purple-900/40 to-fuchsia-900/40 backdrop-blur-sm border border-purple-800/50 rounded-xl p-6"
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(128, 0, 255, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-700/30 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm">Claimed Rewards</h3>
                  <p className="text-2xl font-bold text-white">27</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 backdrop-blur-sm border border-amber-800/50 rounded-xl p-6"
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(255, 165, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-700/30 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm">Active Rewards</h3>
                  <p className="text-2xl font-bold text-white">{rewards.filter(r => r.isActive).length}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Tabs and reward list */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="flex flex-wrap space-x-2 mb-6 border-b border-gray-800 pb-4">
              <button
                className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setActiveTab('all')}
              >
                All Rewards
              </button>
              <button
                className={`px-4 py-2 rounded-md ${activeTab === 'active' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setActiveTab('active')}
              >
                Active Rewards
              </button>
              <button
                className={`px-4 py-2 rounded-md ${activeTab === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                onClick={() => setActiveTab('inactive')}
              >
                Inactive Rewards
              </button>
            </div>
            
            {/* New Reward Form */}
            {showNewRewardForm && (
              <motion.div 
                className="mb-8 bg-gray-800/80 p-6 rounded-lg border border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2 text-purple-400" />
                  Create New Reward
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Reward Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. 10% Off Next Order"
                      value={newReward.name}
                      onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Reward Type
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={newReward.type}
                      onChange={(e) => setNewReward({...newReward, type: e.target.value})}
                    >
                      <option value="discount">Discount</option>
                      <option value="freebie">Free Item/Service</option>
                      <option value="service">Special Service</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {newReward.type === 'discount' ? 'Discount Percentage' : 'Value'}
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={newReward.type === 'discount' ? 'e.g. 10' : '0'}
                      value={newReward.value}
                      onChange={(e) => setNewReward({...newReward, value: parseInt(e.target.value)})}
                      disabled={newReward.type !== 'discount'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Points Required
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. 100"
                      value={newReward.pointsRequired}
                      onChange={(e) => setNewReward({...newReward, pointsRequired: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Expires In (Days)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. 30"
                      value={newReward.expiresIn}
                      onChange={(e) => setNewReward({...newReward, expiresIn: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={newReward.isActive.toString()}
                      onChange={(e) => setNewReward({...newReward, isActive: e.target.value === 'true'})}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe the reward..."
                      value={newReward.description}
                      onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewRewardForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={handleCreateReward}
                    disabled={!newReward.name || !newReward.description}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Create Reward
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Rewards List */}
            {filteredRewards.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                transition={{ staggerChildren: 0.1 }}
              >
                {filteredRewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    className={`bg-gray-800/70 border ${reward.isActive ? 'border-green-800/50' : 'border-red-800/50'} rounded-xl p-5 relative overflow-hidden`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
                  >
                    {reward.isActive && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-900/50 text-green-400">
                          Active
                        </span>
                      </div>
                    )}
                    {!reward.isActive && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-900/50 text-red-400">
                          Inactive
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-gray-700/70">
                        {getRewardIcon(reward.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white">{reward.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{reward.description}</p>
                        
                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm mt-3">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1 text-gray-500" />
                            <span className="text-gray-400">
                              {reward.type === 'discount' 
                                ? `${reward.value}% discount` 
                                : reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Gift className="w-4 h-4 mr-1 text-gray-500" />
                            <span className="text-gray-400">{reward.pointsRequired} points</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                            <span className="text-gray-400">Expires in {reward.expiresIn} days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center border-gray-700 hover:bg-gray-700"
                        onClick={() => handleToggleReward(reward.id)}
                      >
                        {reward.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center border-blue-700 text-blue-500 hover:bg-blue-900/30"
                          onClick={() => setEditingReward(reward)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center border-red-700 text-red-500 hover:bg-red-900/30"
                          onClick={() => handleDeleteReward(reward.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Sparkle effects */}
                    <div className="absolute -top-10 -right-10 w-20 h-20 opacity-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 opacity-10 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full blur-xl"></div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Gift className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Rewards Found</h3>
                  <p className="text-gray-500">
                    {activeTab === 'all' 
                      ? "You haven&apos;t created any rewards yet." 
                      : activeTab === 'active'
                        ? "You don&apos;t have any active rewards."
                        : "You don&apos;t have any inactive rewards."}
                  </p>
                  
                  {!showNewRewardForm && (
                    <Button
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                      onClick={() => setShowNewRewardForm(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Your First Reward
                    </Button>
                  )}
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Explanation Section */}
          <motion.div 
            className="mt-8 bg-blue-900/20 border border-blue-800 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              How Rewards Work
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-blue-950/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-700/70 flex items-center justify-center mr-2">
                    <span className="font-bold">1</span>
                  </div>
                  <h4 className="font-semibold">Create Your Rewards</h4>
                </div>
                <p className="text-gray-400">
                  Define rewards like discounts, free services, or priority treatment for loyal customers.
                </p>
              </div>
              
              <div className="bg-blue-950/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-700/70 flex items-center justify-center mr-2">
                    <span className="font-bold">2</span>
                  </div>
                  <h4 className="font-semibold">Customers Earn Points</h4>
                </div>
                <p className="text-gray-400">
                  Customers earn points with each purchase based on order value and frequency.
                </p>
              </div>
              
              <div className="bg-blue-950/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-700/70 flex items-center justify-center mr-2">
                    <span className="font-bold">3</span>
                  </div>
                  <h4 className="font-semibold">Redeem for Benefits</h4>
                </div>
                <p className="text-gray-400">
                  Customers can redeem their points for rewards you&apos;ve created, building loyalty.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  );
} 