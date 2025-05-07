"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "../solana/privy-solana-adapter";
import { shortenAddress } from "@/lib/utils";
import { User, LogOut, ChevronDown, Scissors, LayoutDashboard, Wallet, ShoppingBag, Paintbrush, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useUsdcBalanceCheck } from "@/hooks/use-usdc-balance-check";
import toast from "react-hot-toast";

export function AuthNav() {
  const { user, logout } = useAuth();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { fundWalletDirectly } = useUsdcBalanceCheck();
  const [isFunding, setIsFunding] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const navigateToProfile = () => {
    router.push("/profile");
    setDropdownOpen(false);
  };
  
  const navigateToOrders = () => {
    router.push("/orders");
    setDropdownOpen(false);
  };
  
  const navigateToTailorDashboard = () => {
    router.push("/tailor/dashboard");
    setDropdownOpen(false);
  };
  
  const navigateToTailorDesigns = () => {
    router.push("/tailor/designs");
    setDropdownOpen(false);
  };
  
  const navigateToTailorOrders = () => {
    router.push("/tailor/orders");
    setDropdownOpen(false);
  };
  
  const navigateToTailorCustomers = () => {
    router.push("/tailor/customers");
    setDropdownOpen(false);
  };
  
  const navigateToTailorSettings = () => {
    router.push("/tailor/settings");
    setDropdownOpen(false);
  };

  const handleFundWallet = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      setIsFunding(true);
      await fundWalletDirectly(10);
      // Success is handled by the hook
    } catch (error) {
      console.error('Error initiating wallet funding:', error);
      toast.error('Could not start funding process');
    } finally {
      setIsFunding(false);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-sm px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
      >
        {user?.accountType === 'TAILOR' ? (
          <Scissors className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span>
          {user?.firstName || (publicKey ? shortenAddress(publicKey.toString()) : "Account")}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 shadow-lg rounded-md py-1 z-50">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </p>
                {user.email && (
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                )}
                {publicKey && (
                  <p className="text-xs text-gray-400 truncate">
                    {shortenAddress(publicKey.toString())}
                  </p>
                )}
                {user.accountType && (
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.accountType === 'TAILOR' 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {user.accountType === 'TAILOR' ? 'Tailor' : 'Customer'}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={navigateToProfile}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
              >
                <User className="h-4 w-4 mr-2" />
                Your Profile
              </button>
              
              <button
                onClick={navigateToOrders}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                My Orders
              </button>
              
              <button
                onClick={handleFundWallet}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isFunding ? 'Funding...' : 'Fund Wallet'}
              </button>
              
              {user.accountType === 'TAILOR' && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-700 my-1"></div>
                  <div className="px-4 py-1">
                    <span className="text-xs text-gray-500 uppercase">Tailor Menu</span>
                  </div>
                
                  <button
                    onClick={navigateToTailorDashboard}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                  
                  <button
                    onClick={navigateToTailorOrders}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Manage Orders
                  </button>
                  
                  <button
                    onClick={navigateToTailorDesigns}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
                  >
                    <Paintbrush className="h-4 w-4 mr-2" />
                    My Designs
                  </button>
                  
                  <button
                    onClick={navigateToTailorCustomers}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Customers
                  </button>
                  
                  <button
                    onClick={navigateToTailorSettings}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                </>
              )}
              
              <div className="border-t border-gray-700 my-1"></div>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="block px-4 py-2 text-sm hover:bg-gray-700"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="block px-4 py-2 text-sm hover:bg-gray-700"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
} 