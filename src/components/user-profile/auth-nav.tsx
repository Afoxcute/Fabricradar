"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "../solana/privy-solana-adapter";
import { shortenAddress } from "@/lib/utils";
import { User, LogOut, ChevronDown, Scissors, LayoutDashboard, Wallet, ShoppingBag, Award } from "lucide-react";
import Link from "next/link";

export function AuthNav() {
  const { user, logout } = useAuth();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const navigateToFundWallet = () => {
    router.push("/fund-wallet");
    setDropdownOpen(false);
  };

  const navigateToRewards = () => {
    router.push("/rewards");
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
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
                onClick={navigateToRewards}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
              >
                <Award className="h-4 w-4 mr-2" />
                Rewards & Offers
              </button>
              
              <button
                onClick={navigateToFundWallet}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Fund Wallet
              </button>
              
              {user.accountType === 'TAILOR' && (
                <button
                  onClick={navigateToTailorDashboard}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Tailor Dashboard
                </button>
              )}
              
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