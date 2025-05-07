"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfileForm, UserProfileFormValues } from "@/components/user-profile/user-profile-form";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "@/components/solana/privy-solana-adapter";
import BackgroundEffect from "@/components/background-effect/background-effect";
import { ArrowLeft, Package } from "lucide-react";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const { publicKey } = useWallet();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleProfileSuccess = async () => {
    try {
      // Refresh user data after successful update
      if (user?.id) {
        await refreshUserData(user.id);
        setIsSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleBack = () => {
    router.push('/account');
  };

  const getUserFormValues = (): Partial<UserProfileFormValues> | undefined => {
    if (!user) return undefined;
    
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      accountType: user.accountType as "USER" | "TAILOR" || 'USER',
    };
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <p className="text-xl text-amber-400 mb-4">You Need to Sign In</p>
            <p className="text-gray-400 mb-6">Please sign in to edit your profile</p>
            <Button onClick={() => router.push('/')}>Go to Home Page</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Account</span>
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
          
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
            {isSuccess && (
              <div className="mb-6 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-center">
                Profile updated successfully!
              </div>
            )}
            
            <UserProfileForm 
              initialValues={getUserFormValues()} 
              onSuccess={handleProfileSuccess} 
              walletAddress={user.walletAddress || publicKey?.toString()}
            />
          </div>
          
          {/* Orders Link */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Package className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-semibold">Your Orders</h3>
            </div>
            <p className="text-gray-400 mb-4">Track your orders and view your measurements</p>
            <div className="flex gap-3">
              <Link href="/orders" className="flex-1">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  View My Orders
                </Button>
              </Link>
              <Link href="/account" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go to Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 