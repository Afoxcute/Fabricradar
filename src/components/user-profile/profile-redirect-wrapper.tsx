'use client'

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "../solana/privy-solana-adapter";
import { UserProfileForm, UserProfileFormValues } from "./user-profile-form";
import BackgroundEffect from "../background-effect/background-effect";
import { Loader2 } from "lucide-react";
import { isProfileComplete, debugProfileStatus } from "@/utils/user-profile-utils";

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
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  // Track logout state
  useEffect(() => {
    // If user is null but the wallet is connected, check if this was due to a logout
    if (!user && connected && publicKey) {
      const isLogout = sessionStorage.getItem("just_logged_out");
      if (isLogout === "true") {
        // Clear the flag and set our state
        sessionStorage.removeItem("just_logged_out");
        setJustLoggedOut(true);
        
        // Reset the flag after navigation completes (3 seconds should be enough)
        setTimeout(() => {
          setJustLoggedOut(false);
        }, 3000);
      }
    } else {
      setJustLoggedOut(false);
    }
  }, [user, connected, publicKey]);

  // Redirect tailor to dashboard when profile is complete and they've connected wallet
  useEffect(() => {
    if (user && 
        connected && 
        publicKey && 
        isProfileComplete(user) && 
        user.accountType === 'TAILOR' &&
        !isCheckingProfile) {
      router.push('/tailor/dashboard');
    }
  }, [user, connected, publicKey, isCheckingProfile, router]);

  useEffect(() => {
    async function checkUserProfile() {
      try {
        // If wallet is not connected, always show the main content
        if (!connected || !publicKey) {
          setIsCheckingProfile(false);
          setNeedsCompletion(false);
          return;
        }

        // If user just logged out, don't redirect to profile completion
        if (justLoggedOut) {
          setIsCheckingProfile(false);
          setNeedsCompletion(false);
          return;
        }

        // Get wallet address as string for API calls
        const walletAddressStr = publicKey.toString();
        
        // If we already have user data and it's complete, no need to check
        if (isProfileComplete(user)) {
          console.log("Profile is complete in local state", debugProfileStatus(user));
          
          // Make sure the wallet address is associated with the user
          if (user?.walletAddress !== walletAddressStr) {
            // Wallet address doesn't match - might need to check for a different user
            try {
              // Check for existing user with this wallet using a direct fetch to avoid encoding issues
              const apiUrl = `/api/user/by-wallet?walletAddress=${encodeURIComponent(walletAddressStr)}`;
              console.log("Checking for user with wallet address:", apiUrl);
              
              const response = await fetch(apiUrl);
              const data = await response.json();
              
              if (data.success && data.user) {
                console.log("Found user with this wallet, updating local storage", debugProfileStatus(data.user));
                // Found a user with this wallet - store in localStorage and refresh
                localStorage.setItem("auth_user", JSON.stringify(data.user));
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
          console.log("Found user with incomplete profile, refreshing data", debugProfileStatus(user));
          // Refresh user data first to make sure we have latest info
          const updatedUser = await refreshUserData(user.id);
          console.log("Refreshed user data:", debugProfileStatus(updatedUser));
          
          // Check if profile is still incomplete after refresh
          if (!isProfileComplete(updatedUser)) {
            console.log("Profile is still incomplete after refresh");
            setNeedsCompletion(true);
          } else {
            console.log("Profile is complete after refresh");
            setNeedsCompletion(false);
          }
        } else if (connected && publicKey) {
          console.log("No user in local storage but wallet is connected, checking API");
          // No user in local storage but wallet is connected - check if a user exists with this wallet address
          try {
            // Use a direct /api/user endpoint instead of trpc to avoid encoding issues
            const apiUrl = `/api/user/by-wallet?walletAddress=${encodeURIComponent(walletAddressStr)}`;
            console.log("Checking for user with wallet address:", apiUrl);
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.user) {
              console.log("Found user with this wallet in API", debugProfileStatus(data.user));
              
              // Check if this user has a complete profile
              if (isProfileComplete(data.user)) {
                console.log("User from API has complete profile");
                // Found a user with this wallet and complete profile - store in localStorage
                localStorage.setItem("auth_user", JSON.stringify(data.user));
                // Refresh the page to update auth context
                window.location.reload();
                return;
              } else {
                console.log("User from API has incomplete profile");
                // Store user in localStorage but mark as needing completion
                localStorage.setItem("auth_user", JSON.stringify(data.user));
                setNeedsCompletion(true);
              }
            } else {
              console.log("No user found with this wallet address");
              // No user found with this wallet address - needs profile completion
              setNeedsCompletion(true);
            }
          } catch (error) {
            console.error("Error checking wallet user:", error);
            // Error occurred - default to showing profile completion
            setNeedsCompletion(true);
          }
        }
      } catch (error) {
        console.error("Error in checkUserProfile:", error);
      } finally {
        setIsCheckingProfile(false);
      }
    }

    checkUserProfile();
  }, [connected, publicKey, user, refreshUserData, associateWalletWithUser, justLoggedOut]);

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
      walletAddress: user.walletAddress || undefined,
      accountType: (user.accountType as "USER" | "TAILOR") || "USER"
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
  if (needsCompletion && !justLoggedOut) {
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