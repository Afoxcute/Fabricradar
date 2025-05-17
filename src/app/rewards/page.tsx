'use client';

import React from 'react';
import { CustomerRewards } from '@/components/rewards/customer-rewards';
import { Award, Percent, Gift, BarChart, Clock } from 'lucide-react';

export default function RewardsPage() {
  return (
    <div className="bg-gradient-to-b from-[#050b18] to-[#0a1428] min-h-screen text-white pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Rewards & Offers</h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Explore special rewards and offers from our top tailors. Redeem them during checkout to enjoy discounts, 
            free items, loyalty points, and priority services.
          </p>
        </div>
        
        {/* Rewards Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Discounts</h3>
            <p className="text-gray-400 text-sm">
              Get percentage discounts on your custom clothing orders
            </p>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Free Items</h3>
            <p className="text-gray-400 text-sm">
              Receive complimentary items with qualifying purchases
            </p>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Loyalty Points</h3>
            <p className="text-gray-400 text-sm">
              Earn and redeem points for future purchases and perks
            </p>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Priority Service</h3>
            <p className="text-gray-400 text-sm">
              Get fast-tracked processing and fulfillment for your orders
            </p>
          </div>
        </div>
        
        {/* How to Use Rewards Section */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">How to Use Rewards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-medium mb-2">Browse Rewards</h3>
              <p className="text-gray-400 text-sm">
                Explore available rewards from tailors and find ones that match your needs
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-medium mb-2">Copy Your Code</h3>
              <p className="text-gray-400 text-sm">
                Click &quot;Copy Code&quot; on any reward to save it for checkout
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-medium mb-2">Apply at Checkout</h3>
              <p className="text-gray-400 text-sm">
                During checkout, open the Rewards section and apply your saved reward
              </p>
            </div>
          </div>
        </div>
        
        {/* Available Rewards Component */}
        <CustomerRewards />
      </div>
    </div>
  );
} 