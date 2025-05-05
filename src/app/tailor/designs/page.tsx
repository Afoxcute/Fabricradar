'use client';

import React, { useState } from 'react';
import Header from '@/components/header/header';
import { useAuth } from '@/providers/auth-provider';
import BackgroundEffect from '@/components/background-effect/background-effect';
import { TailorNav } from '@/components/tailor/tailor-nav';
import DesignForm from '@/components/design/design-form';
import DesignList from '@/components/design/design-list';
import { PlusCircle, XCircle } from 'lucide-react';

const DesignsPage = () => {
  const { user, isLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
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

  const handleDesignSuccess = () => {
    // Hide form after successful submission
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="flex">
        <TailorNav />
        
        <div className="ml-64 flex-1 p-8 relative z-10">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Designs</h1>
              <p className="text-gray-400 mt-2">
                Manage your design portfolio here.
              </p>
            </div>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showForm 
                  ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50' 
                  : 'bg-cyan-900/30 text-cyan-500 hover:bg-cyan-800/50'
              }`}
            >
              {showForm ? (
                <>
                  <XCircle size={18} />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Add New Design</span>
                </>
              )}
            </button>
          </div>

          {/* Design Form */}
          {showForm && (
            <div className="mb-8">
              <DesignForm onSuccess={handleDesignSuccess} />
            </div>
          )}

          {/* Design List */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Your Designs</h2>
            {user && (
              <DesignList tailorId={user.id} showActions={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignsPage; 