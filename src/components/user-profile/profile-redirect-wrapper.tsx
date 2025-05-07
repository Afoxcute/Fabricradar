'use client'

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "../solana/privy-solana-adapter";
import { UserProfileForm, UserProfileFormValues } from "./user-profile-form";
import BackgroundEffect from "../background-effect/background-effect";
import { Loader2 } from "lucide-react";
import { isProfileComplete, debugProfileStatus } from "@/utils/user-profile-utils";
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';

interface ProfileRedirectWrapperProps {
  children: ReactNode;
}

export function ProfileRedirectWrapper({ children }: ProfileRedirectWrapperProps) {
  const { 
    user, 
    isLoading: authLoading, 
    refreshUserData, 
    associateWalletWithUser
  } = useAuth();
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isWalletLinking, setIsWalletLinking] = useState(false);
  const [linkingComplete, setLinkingComplete] = useState(false);

  // Skip profile checks for these paths
  const excludedPaths = [
    '/auth', 
    '/profile', 
    '/tailor/dashboard',
    '/tailor/orders',
    '/tailor/designs'
  ];
  
  const isExcludedPath = excludedPaths.some(path => pathname.startsWith(path));
  
  // Check user profile on component mount
  useEffect(() => {
    // Skip check if on excluded paths
    if (isExcludedPath) {
      setIsCheckingProfile(false);
      return;
    }
    
    async function checkUserProfile() {
      try {
        setIsCheckingProfile(true);
        
        if (!user) {
          // If not logged in, no need to check profile
          setIsCheckingProfile(false);
          return;
        }
        
        // Get the latest user data
        if (user.id) {
          const refreshedUser = await refreshUserData(user.id);
          
          if (!refreshedUser) {
            // Failed to get user data, consider profile not ready
            setProfileComplete(false);
            setShowProfileForm(true);
            setIsCheckingProfile(false);
            return;
          }
          
          const isComplete = isProfileComplete(refreshedUser);
          
          if (!isComplete) {
            // Profile is not complete, show the form
            setProfileComplete(false);
            setShowProfileForm(true);
            setIsCheckingProfile(false);
            return;
          }
          
          // If we have a wallet connection but user's wallet is different or not set
          if (connected && publicKey) {
            const walletAddress = publicKey.toString();
            
            if (!refreshedUser.walletAddress || refreshedUser.walletAddress !== walletAddress) {
              // Need to link the wallet
              setIsWalletLinking(true);
              setIsCheckingProfile(false);
              return;
            }
          }
          
          // Profile is complete and wallet is linked if necessary
          setProfileComplete(true);
          setIsCheckingProfile(false);
        } else {
          // No user ID, consider profile not ready
          setProfileComplete(false);
          setShowProfileForm(true);
          setIsCheckingProfile(false);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setIsCheckingProfile(false);
        setProfileComplete(false);
        setShowProfileForm(true);
      }
    }
    
    checkUserProfile();
  }, [user, connected, publicKey, refreshUserData, router, isExcludedPath]);
  
  // Link wallet to user when needed
  // Define the function outside of useEffect to comply with strict mode
  const linkWalletToUser = async () => {
    try {
      setLinkingComplete(false);
      const walletAddress = publicKey!.toString();
      
      // Call API to associate wallet with user
      await associateWalletWithUser(user!.id, walletAddress);
      
      // Successfully linked
      setLinkingComplete(true);
      setIsWalletLinking(false);
      setProfileComplete(true);
    } catch (error) {
      console.error('Error linking wallet to user:', error);
      setIsWalletLinking(false);
      setProfileComplete(false); // Consider profile not complete if wallet linking fails
      setShowProfileForm(true);
    }
  };
  
  // Link wallet to user when needed
  useEffect(() => {
    if (isWalletLinking && user?.id && connected && publicKey) {
      linkWalletToUser();
    }
  }, [isWalletLinking, user, connected, publicKey]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleProfileSuccess = () => {
    setShowProfileForm(false);
    setProfileComplete(true);
  };
  
  const getUserFormValues = (): Partial<UserProfileFormValues> | undefined => {
    if (!user) return undefined;
    
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    };
  };
  
  // If excluded path, skip checking and show children
  if (isExcludedPath) {
    return children;
  }
  
  // If we're still checking the profile, show a loading state
  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Setting up your experience...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If wallet is being linked, show linking state
  if (isWalletLinking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Linking your wallet...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If profile form should be shown
  if (showProfileForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
              <p className="text-gray-400">Please provide your information to continue using the platform.</p>
            </div>
            
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
              <UserProfileForm 
                initialValues={getUserFormValues()} 
                onSuccess={handleProfileSuccess} 
                walletAddress={publicKey?.toString()}
                isSignUp={!user?.firstName && !user?.lastName} // Treat as sign up if no name set
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If profile is complete, render children
  return <>{children}</>;
} 