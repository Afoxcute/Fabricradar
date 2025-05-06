"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "../trpc/react";
import toast from "react-hot-toast";
import { ClientTRPCErrorHandler } from "@/lib/utils";
import { useWallet } from "@/components/solana/privy-solana-adapter";
import { isProfileComplete, debugProfileStatus } from "@/utils/user-profile-utils";

interface User {
  id: number;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  walletAddress?: string | null;
  accountType?: "USER" | "TAILOR" | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUserData: (userId: number) => Promise<User | null>;
  associateWalletWithUser: (userId: number, walletAddress: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { disconnect, publicKey, connected } = useWallet();

  // Login mutation
  const loginMutation = api.users.login.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  // Update user mutation for wallet association
  const updateUserMutation = api.users.updateUser.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  // Create a query function for fetching user data
  // TODO: Replace this workaround with proper tRPC client usage once the correct syntax is determined
  // This is a temporary solution to bypass TypeScript errors with the tRPC client
  const getUserById = async (userId: number) => {
    try {
      // Use traditional fetch API call to the tRPC endpoint
      const response = await fetch(`/api/trpc/users.getUserById?input=${encodeURIComponent(JSON.stringify({ userId }))}`);
      const data = await response.json();
      
      if (data.result?.data) {
        return data.result.data;
      }
      
      throw new Error(data.error?.message || 'Failed to fetch user data');
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  // Function to fetch the latest user data from server
  const refreshUserData = async (userId: number) => {
    if (!userId) return null;
    
    try {
      setIsLoading(true);
      
      const fetchedUser = await getUserById(userId);
      
      if (fetchedUser) {
        console.log("Successfully refreshed user data:", debugProfileStatus(fetchedUser));
        // Update localStorage and state with fresh data
        const existingData = localStorage.getItem("auth_user");
        if (existingData) {
          // Merge with existing data to preserve client-side fields
          const existingUser = JSON.parse(existingData);
          const mergedUser = { ...existingUser, ...fetchedUser };
          localStorage.setItem("auth_user", JSON.stringify(mergedUser));
          setUser(mergedUser);
          return mergedUser;
        } else {
          localStorage.setItem("auth_user", JSON.stringify(fetchedUser));
          setUser(fetchedUser);
          return fetchedUser;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize state from localStorage on client
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // If wallet is connected, prioritize finding a user by wallet address
        if (connected && publicKey) {
          const walletAddressStr = publicKey.toString();
          console.log("Wallet connected, checking for a user with this wallet address first");
          
          try {
            // Use direct API endpoint to find a user with this wallet
            const apiUrl = `/api/user/by-wallet?walletAddress=${encodeURIComponent(walletAddressStr)}`;
            console.log("Checking for user with wallet address:", apiUrl);
            
            const response = await fetch(apiUrl);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success && data.user) {
                console.log("Found user with connected wallet, using this data", debugProfileStatus(data.user));
                // Found a user with this wallet - update localStorage and state
                localStorage.setItem("auth_user", JSON.stringify(data.user));
                setUser(data.user);
                setIsLoading(false);
                return; // Exit early - we've found our user
              } else {
                console.log("No user found with this wallet address, checking localStorage");
              }
            } else {
              console.log("API error or no user found with wallet:", response.status);
            }
          } catch (error) {
            console.error("Error checking wallet user:", error);
          }
        }
        
        // If we get here, either no wallet is connected, or no user was found with the wallet
        // Check localStorage as fallback
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // If wallet is connected, ensure we're not using mismatched data
            if (connected && publicKey) {
              const walletAddressStr = publicKey.toString();
              
              // If stored user has a different wallet, clear it and return null
              // This prevents mixing profiles between different wallets
              if (parsedUser.walletAddress && parsedUser.walletAddress !== walletAddressStr) {
                console.log("Stored user has different wallet address, clearing local storage");
                localStorage.removeItem("auth_user");
                setUser(null);
                setIsLoading(false);
                return;
              }
              
              // If we get here, either the wallet matches or user has no wallet yet
              console.log("Using stored user data or associating wallet", debugProfileStatus(parsedUser));
              setUser(parsedUser);
              
              // If user has no wallet address yet, associate this one
              if (!parsedUser.walletAddress && parsedUser.id) {
                console.log("User has no wallet, associating current wallet");
                associateWalletWithUser(parsedUser.id, walletAddressStr);
              }
            } else {
              // No wallet connected, just use stored user
              console.log("No wallet connected, using stored user data", debugProfileStatus(parsedUser));
              setUser(parsedUser);
            }
          } catch (error) {
            console.error("Failed to parse stored user", error);
            localStorage.removeItem("auth_user");
            setUser(null);
          }
        } else {
          // No stored user
          console.log("No stored user data");
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  // Add effect to detect wallet disconnection and clear localStorage
  useEffect(() => {
    // If previously connected but now disconnected, clear localStorage
    if (!connected && publicKey === null) {
      // Check if we have a stored user with a wallet address
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.walletAddress) {
            console.log("Wallet disconnected, clearing localStorage to prevent profile mixing");
            localStorage.removeItem("auth_user");
            setUser(null);
            
            // Set a flag in sessionStorage to indicate the wallet just disconnected
            sessionStorage.setItem("just_wallet_disconnected", "true");
          }
        } catch (error) {
          console.error("Failed to parse stored user while checking wallet disconnect", error);
        }
      }
    }
    
    // When wallet connects again, clear the disconnection flag
    if (connected && publicKey) {
      sessionStorage.removeItem("just_wallet_disconnected");
    }
  }, [connected, publicKey]);

  // Function to handle login
  const login = async (identifier: string, otp: string) => {
    setIsLoading(true);
    
    try {
      const userData = await loginMutation.mutateAsync({
        identifier,
        otp,
      });
      
      if (userData) {
        // Store user data in localStorage and state
        localStorage.setItem("auth_user", JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle logout
  const logout = () => {
    // Clear user data
    localStorage.removeItem("auth_user");
    setUser(null);
    
    // Set a flag in sessionStorage to indicate the user just logged out
    sessionStorage.setItem("just_logged_out", "true");
    
    // Disconnect wallet to prevent profile completion redirect
    try {
      if (disconnect) {
        disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet during logout:", error);
    }
    
    // Navigate to home page unless already there
    if (pathname !== "/") {
      router.push("/");
    }
  };

  // Function to associate wallet address with user
  const associateWalletWithUser = async (userId: number, walletAddress: string) => {
    if (!userId) return null;
    
    try {
      setIsLoading(true);
      
      // Use the mutation to update the user
      const userData = await updateUserMutation.mutateAsync({
        userId,
        walletAddress
      });
      
      if (userData) {
        console.log("Successfully associated wallet with user:", userData);
        // Update localStorage and state with the updated user
        localStorage.setItem("auth_user", JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error("Error associating wallet with user:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserData, associateWalletWithUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 