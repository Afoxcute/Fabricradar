'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/header/header';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Footer from '@/components/footer/footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { Award, Gift, Sparkles, Lock, ChevronRight, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Define interfaces for our data types
interface Tailor {
  name: string;
  image: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  type: string;
  value: number;
  pointsRequired: number;
  isLocked: boolean;
  tailor: Tailor;
  expiresIn: number;
}

interface RedeemedReward {
  id: number;
  name: string;
  description: string;
  redeemedAt: Date;
  pointsSpent: number;
  status: string;
  tailor: Tailor;
}

export default function RewardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pointsBalance, setPointsBalance] = useState(180); // Mock points balance
  
  // Mock rewards data
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([
    {
      id: 1,
      name: "10% Off Next Order",
      description: "Get 10% off your next custom order with any tailor!",
      type: "discount",
      value: 10,
      pointsRequired: 100,
      isLocked: false,
      tailor: {
        name: "Tailor Module",
        image: "/placeholder.svg"
      },
      expiresIn: 30
    },
    {
      id: 2,
      name: "Free Fabric Upgrade",
      description: "Upgrade to premium fabric at no extra cost on your next order",
      type: "freebie",
      value: 0,
      pointsRequired: 250,
      isLocked: true,
      tailor: {
        name: "Elite Tailoring",
        image: "/placeholder.svg"
      },
      expiresIn: 60
    },
    {
      id: 3,
      name: "Priority Tailoring",
      description: "Skip the queue! Get your order prioritized above others.",
      type: "service",
      value: 0,
      pointsRequired: 150,
      isLocked: false,
      tailor: {
        name: "Tailor Module",
        image: "/placeholder.svg"
      },
      expiresIn: 45
    }
  ]);
  
  const [redeemHistory, setRedeemHistory] = useState<RedeemedReward[]>([
    {
      id: 101,
      name: "5% Off Order",
      description: "A discount on your custom order",
      redeemedAt: new Date("2023-10-15"),
      pointsSpent: 50,
      status: "used",
      tailor: {
        name: "Modern Fits",
        image: "/placeholder.svg"
      }
    }
  ]);
  
  // Handle reward redemption
  const handleRedeemReward = (reward: Reward) => {
    if (reward.isLocked || pointsBalance < reward.pointsRequired) {
      toast.error("You don't have enough points to redeem this reward");
      return;
    }
    
    // Simulate redemption
    setPointsBalance(prev => prev - reward.pointsRequired);
    
    // Add to redeemed rewards
    const redeemedReward: RedeemedReward = {
      id: Date.now(),
      name: reward.name,
      description: reward.description,
      redeemedAt: new Date(),
      pointsSpent: reward.pointsRequired,
      status: "active",
      tailor: reward.tailor
    };
    
    setRedeemHistory([redeemedReward, ...redeemHistory]);
    toast.success(`Reward "${reward.name}" redeemed successfully!`);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white">
      <BackgroundEffect />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold flex items-center">
              <Award className="mr-3 h-8 w-8 text-yellow-400" />
              My Rewards
            </h1>
            <p className="text-gray-400 mt-1">Earn and redeem rewards with your favorite tailors</p>
          </motion.div>
          
          <motion.div
            className="bg-gradient-to-r from-amber-800/40 to-yellow-700/40 backdrop-blur-sm rounded-xl p-4 mt-4 md:mt-0 border border-amber-800/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-600/50 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Your Points Balance</p>
                <p className="text-2xl font-bold text-yellow-400">{pointsBalance} points</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {!user && (
          <motion.div
            className="bg-blue-900/30 border border-blue-800 rounded-xl p-6 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Gift className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <h2 className="text-xl font-semibold text-white">Sign In to Manage Your Rewards</h2>
            <p className="text-gray-400 mb-4">Connect your wallet to track your rewards and redeem special offers</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/signin')}
            >
              Sign In to Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
        
        {/* Available Rewards Section */}
        <motion.div
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Gift className="mr-2 h-6 w-6 text-purple-400" />
            Available Rewards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRewards.map((reward) => (
              <motion.div
                key={reward.id}
                className={`bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border ${
                  reward.isLocked || pointsBalance < reward.pointsRequired
                    ? 'border-gray-700'
                    : 'border-green-700'
                } relative overflow-hidden`}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* Glassmorphism effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent pointer-events-none"></div>
                
                {/* Reward header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold text-white mb-1">{reward.name}</h3>
                      {reward.isLocked && (
                        <div className="ml-2 p-1 bg-gray-700 rounded-full">
                          <Lock className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{reward.description}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    <Image
                      src={reward.tailor.image}
                      alt={reward.tailor.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                </div>
                
                {/* Reward details */}
                <div className="flex justify-between items-center mt-4">
                  <div className="bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-800/50">
                    <p className="text-yellow-400 text-sm font-medium">{reward.pointsRequired} points</p>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Expires in {reward.expiresIn} days</span>
                  </div>
                </div>
                
                {/* Redeem button */}
                <Button
                  className={`w-full mt-4 ${
                    reward.isLocked || pointsBalance < reward.pointsRequired
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700'
                  }`}
                  disabled={reward.isLocked || pointsBalance < reward.pointsRequired}
                  onClick={() => handleRedeemReward(reward)}
                >
                  {reward.isLocked ? (
                    <span className="flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      Locked
                    </span>
                  ) : pointsBalance < reward.pointsRequired ? (
                    "Not Enough Points"
                  ) : (
                    "Redeem Reward"
                  )}
                </Button>
                
                {/* Progress indicator for points */}
                {!reward.isLocked && pointsBalance < reward.pointsRequired && (
                  <div className="mt-2">
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-600 to-amber-400"
                        style={{ width: `${Math.min(100, (pointsBalance / reward.pointsRequired) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {pointsBalance}/{reward.pointsRequired} points
                    </p>
                  </div>
                )}
                
                {/* Sparkle effects */}
                <div className="absolute -top-10 -left-10 w-24 h-24 opacity-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 opacity-5 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full blur-xl"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Redeemed Rewards Section */}
        {redeemHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Check className="mr-2 h-6 w-6 text-green-400" />
              Your Redeemed Rewards
            </h2>
            
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              {redeemHistory.map((reward, index) => (
                <div 
                  key={reward.id}
                  className={`flex items-center justify-between py-4 ${
                    index < redeemHistory.length - 1 ? 'border-b border-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                      <Image
                        src={reward.tailor.image}
                        alt={reward.tailor.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{reward.name}</h3>
                      <p className="text-sm text-gray-400">{reward.description}</p>
                      <div className="flex space-x-3 text-xs text-gray-500 mt-1">
                        <span>
                          {reward.redeemedAt.toLocaleDateString()}
                        </span>
                        <span>
                          {reward.pointsSpent} points
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reward.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {reward.status === 'active' ? 'Ready to Use' : 'Used'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* How to Earn Points Section */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-900/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-400" />
            How to Earn More Points
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-950/30 rounded-lg p-4">
              <div className="w-8 h-8 rounded-full bg-blue-700/50 flex items-center justify-center mb-3">
                <Gift className="h-4 w-4 text-blue-300" />
              </div>
              <h3 className="font-semibold mb-1">Make a Purchase</h3>
              <p className="text-sm text-gray-400">
                Earn 10 points for every $1 spent on custom tailoring services
              </p>
            </div>
            
            <div className="bg-blue-950/30 rounded-lg p-4">
              <div className="w-8 h-8 rounded-full bg-blue-700/50 flex items-center justify-center mb-3">
                <Award className="h-4 w-4 text-blue-300" />
              </div>
              <h3 className="font-semibold mb-1">Complete Your Profile</h3>
              <p className="text-sm text-gray-400">
                Earn 50 bonus points by filling out your full profile details
              </p>
            </div>
            
            <div className="bg-blue-950/30 rounded-lg p-4">
              <div className="w-8 h-8 rounded-full bg-blue-700/50 flex items-center justify-center mb-3">
                <Sparkles className="h-4 w-4 text-blue-300" />
              </div>
              <h3 className="font-semibold mb-1">Refer Friends</h3>
              <p className="text-sm text-gray-400">
                Get 100 points for each friend who signs up and makes their first purchase
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
} 