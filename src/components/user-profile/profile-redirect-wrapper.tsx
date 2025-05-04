'use client'

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "../solana/privy-solana-adapter";
import { UserProfileForm, UserProfileFormValues } from "./user-profile-form";
import BackgroundEffect from "../background-effect/background-effect";
import { Loader2 } from "lucide-react";

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
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [needsCompletion, setNeedsCompletion] = useState(false);

  useEffect(() => {
    async function checkUserProfile() {
      // If wallet is not connected, always show the main content
      if (!connected || !publicKey) {
        setIsCheckingProfile(false);
        setNeedsCompletion(false);
        return;
      }

      // Get wallet address as string for API calls
      const walletAddressStr = publicKey.toString();
      
      // If we already have user data and it's complete, no need to check
      if (
        user &&
        user.firstName &&
        user.lastName &&
        (user.email || user.phone)
      ) {
        // Make sure the wallet address is associated with the user
        if (user.walletAddress !== walletAddressStr) {
          // Wallet address doesn't match - might need to check for a different user
          try {
            // Try to find a user with this wallet address using the API directly
            const response = await fetch(`/api/trpc/users.getUserByWallet?input=${encodeURIComponent(JSON.stringify({ walletAddress: walletAddressStr }))}`);
            const data = await response.json();
            
            if (data.result?.data) {
              // Found a user with this wallet - store in localStorage and refresh
              localStorage.setItem("auth_user", JSON.stringify(data.result.data));
              window.location.reload(); // Force reload to update auth context
              return;
            }
          } catch (error) {
            console.error("Error checking wallet user:", error);
          }
        }
        
        setIsCheckingProfile(false);
        setNeedsCompletion(false);
        return;
      }

      // If user exists but profile is incomplete
      if (user && user.id) {
        // Refresh user data first to make sure we have latest info
        const updatedUser = await refreshUserData(user.id);
        
        // Check if profile is still incomplete
        if (
          !updatedUser ||
          !updatedUser.firstName ||
          !updatedUser.lastName ||
          (!updatedUser.email && !updatedUser.phone)
        ) {
          setNeedsCompletion(true);
        } else {
          setNeedsCompletion(false);
        }
      } else if (connected && publicKey) {
        // No user in local storage but wallet is connected - check if a user exists with this wallet address
        try {
          // Try to find a user with this wallet address
          const response = await fetch(`/api/trpc/users.getUserByWallet?input=${encodeURIComponent(JSON.stringify({ walletAddress: walletAddressStr }))}`);
          const data = await response.json();
          
          if (data.result?.data) {
            // Found a user with this wallet - store in localStorage
            localStorage.setItem("auth_user", JSON.stringify(data.result.data));
            // Refresh the page to update auth context
            window.location.reload();
            return;
          } else {
            // No user found with this wallet address - needs profile completion
            setNeedsCompletion(true);
          }
        } catch (error) {
          console.error("Error checking wallet user:", error);
          // Error occurred - default to showing profile completion
          setNeedsCompletion(true);
        }
      }
      
      setIsCheckingProfile(false);
    }

    checkUserProfile();
  }, [connected, publicKey, user, refreshUserData, associateWalletWithUser]);

  // Link wallet with user when both are available but not yet linked
  useEffect(() => {
    async function linkWalletToUser() {
      if (
        !authLoading && 
        user?.id && 
        connected && 
        publicKey && 
        user.walletAddress !== publicKey.toString()
      ) {
        try {
          // Associate this wallet with the user
          await associateWalletWithUser(user.id, publicKey.toString());
          console.log("Wallet linked to user profile");
        } catch (error) {
          console.error("Failed to link wallet to user:", error);
        }
      }
    }

    linkWalletToUser();
  }, [user, authLoading, connected, publicKey, associateWalletWithUser]);

  // Handle successful profile completion
  const handleProfileSuccess = () => {
    setNeedsCompletion(false);
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

  // Show loader while checking profile status
  if (authLoading || isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-cyan-500" />
          <p className="mt-4 text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If profile needs completion, show the profile completion form
  if (needsCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden flex items-center justify-center">
        <BackgroundEffect />
        
        <div className="card bg-gray-900/30 backdrop-blur-sm shadow-xl max-w-lg w-full p-6 rounded-xl">
          <UserProfileForm 
            initialValues={getUserFormValues()}
            walletAddress={publicKey?.toString()}
            onSuccess={handleProfileSuccess}
          />
        </div>
      </div>
    );
  }

  // If profile is complete, render children
  return <>{children}</>;
} 