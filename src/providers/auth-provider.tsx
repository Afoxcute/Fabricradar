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

  // Initialize state from localStorage on client
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            console.log("Loaded user data from localStorage:", debugProfileStatus(parsedUser));
            
            // If wallet is connected, ensure the user's walletAddress matches
            if (connected && publicKey && parsedUser.id) {
              const walletAddressStr = publicKey.toString();
              
              // If wallet doesn't match the stored user, check if another user exists with this wallet
              if (parsedUser.walletAddress !== walletAddressStr) {
                console.log("Wallet address mismatch, checking for user with connected wallet");
                try {
                  const response = await fetch(`/api/trpc/users.getUserByWallet?input=${encodeURIComponent(JSON.stringify({ walletAddress: walletAddressStr }))}`);
                  const data = await response.json();
                  
                  if (data.result?.data) {
                    console.log("Found user with connected wallet, updating local storage", debugProfileStatus(data.result.data));
                    // Found a user with this wallet - update localStorage and state
                    localStorage.setItem("auth_user", JSON.stringify(data.result.data));
                    setUser(data.result.data);
                  } else {
                    // No user found with this wallet - refresh current user data instead
                    if (parsedUser.id) {
                      console.log("No user found with wallet, refreshing current user data");
                      refreshUserData(parsedUser.id);
                    }
                  }
                } catch (error) {
                  console.error("Error checking wallet user:", error);
                }
              } else if (parsedUser.id) {
                // Wallet matches but let's refresh user data to ensure it's up to date
                console.log("Refreshing user data on load");
                refreshUserData(parsedUser.id);
              }
            }
          } catch (error) {
            console.error("Failed to parse stored user", error);
            localStorage.removeItem("auth_user");
            setUser(null);
          }
        } else {
          setUser(null);
          
          // If wallet is connected but no user in storage, check if a user exists with this wallet
          if (connected && publicKey) {
            const walletAddressStr = publicKey.toString();
            console.log("No user in storage but wallet connected, checking API");
            
            try {
              const response = await fetch(`/api/trpc/users.getUserByWallet?input=${encodeURIComponent(JSON.stringify({ walletAddress: walletAddressStr }))}`);
              const data = await response.json();
              
              if (data.result?.data) {
                console.log("Found user with connected wallet", debugProfileStatus(data.result.data));
                // Found a user with this wallet - update localStorage and state
                localStorage.setItem("auth_user", JSON.stringify(data.result.data));
                setUser(data.result.data);
              }
            } catch (error) {
              console.error("Error checking wallet user:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [connected, publicKey]);

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