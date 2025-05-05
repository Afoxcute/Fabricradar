'use client';

import React, { useState } from 'react';
import Header from '@/components/header/header';
import { useAuth } from '@/providers/auth-provider';
import BackgroundEffect from '@/components/background-effect/background-effect';
import { TailorNav } from '@/components/tailor/tailor-nav';
import DesignForm from '@/components/design/design-form';
import DesignList from '@/components/design/design-list';
import { AlertCircle, PlusCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';

// Define the Design type
interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  averageTimeline: string;
  tailorId: number;
}

const DesignsPage = () => {
  const { user, isLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [designToEdit, setDesignToEdit] = useState<Design | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  
  // If still loading, show loading state
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
  
  // If user is not a tailor, show access denied
  if (user && user.accountType !== 'TAILOR') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-900/30 border border-red-800 text-white px-6 py-8 rounded-lg flex flex-col items-center text-center max-w-2xl mx-auto">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              This area is only accessible to tailor accounts. 
              Please contact support if you believe this is an error.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, prompt to log in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <div className="bg-blue-900/30 border border-blue-800 text-white px-6 py-8 rounded-lg flex flex-col items-center text-center max-w-2xl mx-auto">
            <AlertCircle size={48} className="text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Login Required</h1>
            <p className="text-gray-300 mb-6">
              Please log in to access the tailor dashboard.
            </p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDesignSuccess = () => {
    // Hide form after successful submission
    setShowForm(false);
    // Reset editing state
    setIsEditing(false);
    setDesignToEdit(null);
  };
  
  const handleEditDesign = (design: Design) => {
    setDesignToEdit(design);
    setIsEditing(true);
    setShowForm(true);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setDesignToEdit(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="flex">
        <TailorNav />
        
        <div className="ml-64 flex-1 p-8 relative z-10">
          <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">My Designs</h1>
              <p className="text-gray-400 mt-2">
                Create and manage your design portfolio
              </p>
            </div>
            
            <button
              onClick={handleCancelForm}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showForm 
                  ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50' 
                  : 'bg-cyan-900/30 text-cyan-500 hover:bg-cyan-800/50'
              }`}
            >
              {showForm ? (
                <>
                  <XCircle size={18} />
                  <span>Cancel {isEditing ? 'Edit' : 'New Design'}</span>
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
            <div className="mb-8 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? 'Edit Design' : 'Create New Design'}
              </h2>
              <DesignForm 
                onSuccess={handleDesignSuccess} 
                designToEdit={designToEdit}
                isEditing={isEditing}
              />
            </div>
          )}

          {/* Design List */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Your Design Collection</h2>
            <p className="text-gray-400 mb-6">
              These designs are visible to customers on the platform.
            </p>
            
            {user && (
              <DesignList 
                tailorId={user.id} 
                showActions={true} 
                onEditDesign={handleEditDesign}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignsPage; 