'use client';

import React from 'react';
import Header from '@/components/header/header';
import { useAuth } from '@/providers/auth-provider';
import BackgroundEffect from '@/components/background-effect/background-effect';
import { TailorNav } from '@/components/tailor/tailor-nav';

const DesignsPage = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="flex">
        <TailorNav />
        
        <div className="ml-64 flex-1 p-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Designs</h1>
            <p className="text-gray-400 mt-2">
              Manage your design portfolio here.
            </p>
          </div>

          {/* Design portfolio content will go here */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <p className="text-center text-gray-400 py-8">
              Design management features coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignsPage; 