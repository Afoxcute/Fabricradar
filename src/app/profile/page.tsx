"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfileForm, UserProfileFormValues } from "@/components/user-profile/user-profile-form";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "@/components/solana/privy-solana-adapter";
import BackgroundEffect from "@/components/background-effect/background-effect";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

export default function ProfilePage() {
  const { user, refreshUserData } = useAuth();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleProfileSuccess = async () => {
    if (user?.id) {
      await refreshUserData(user.id);
      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  // Convert user data to the format expected by UserProfileForm
  const getUserFormValues = (): Partial<UserProfileFormValues> | undefined => {
    if (!user) return undefined;
    
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || undefined,
      phone: user.phone || undefined,
      walletAddress: user.walletAddress || undefined
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden">
      <BackgroundEffect />
      
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <button 
          onClick={handleBack}
          className="flex items-center mb-6 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Back</span>
        </button>
        
        <div className="max-w-xl mx-auto">
          <div className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            {isSuccess && (
              <div className="mb-6 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-center">
                Profile updated successfully!
              </div>
            )}
            
            <UserProfileForm 
              initialValues={getUserFormValues()} 
              walletAddress={publicKey?.toString()}
              onSuccess={handleProfileSuccess}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 