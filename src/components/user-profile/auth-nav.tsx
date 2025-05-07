"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useWallet } from "../solana/privy-solana-adapter";
import { shortenAddress } from "@/lib/utils";
import { User, ChevronDown, Scissors, Wallet } from "lucide-react";
import Link from "next/link";
import { UserProfileMini } from "./user-profile-mini";

export function AuthNav() {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-sm px-3 py-2 rounded-lg bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700 hover:border-gray-600 transition-colors"
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          user?.accountType === 'TAILOR' 
            ? 'bg-cyan-500/20 text-cyan-400' 
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {user?.accountType === 'TAILOR' ? (
            <Scissors className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
        </div>
        <span className="max-w-[120px] truncate">
          {user?.firstName 
            ? `${user.firstName}${user.lastName ? ` ${user.lastName.charAt(0)}.` : ''}` 
            : (publicKey ? shortenAddress(publicKey.toString()) : "Account")}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 bg-gray-800/90 backdrop-blur-sm border border-gray-700 shadow-xl rounded-xl z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-5">
          {user ? (
            <UserProfileMini />
          ) : (
            <div className="py-2">
              <Link
                href="/auth/signin"
                className="block px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-cyan-400" />
                  <span>Sign In</span>
                </div>
              </Link>
              <Link
                href="/auth/signup"
                className="block px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-cyan-400" />
                  <span>Create Account</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 