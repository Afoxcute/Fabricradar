'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  ChevronRight,
  Copy,
  Check,
  Loader2,
  Wallet,
  Award,
  User,
  ChevronDown,
} from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '../solana/privy-solana-adapter';
import Image from 'next/image';
import { useGetAllBalances } from '../account/account-data-access';
import { PublicKey } from '@solana/web3.js';
import { TokenBalances } from '../account/account-ui';
import { useRouter } from 'next/navigation';
import { shortenAddress, copyToClipboard } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { AuthNav } from '../user-profile/auth-nav';
import { OrderNotifications } from '../notifications/order-notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Header = () => {
  const { ready, authenticated, login } = usePrivy();
  const wallet = useWallet();
  const { user } = useAuth();
  const router = useRouter();
  const disableLogin = !ready || (ready && authenticated);
  const [copied, setCopied] = useState(false);

  // Create a state to safely store the PublicKey for the balance query
  const [publicKeyForBalance, setPublicKeyForBalance] =
    useState<PublicKey | null>(null);

  // Update the publicKeyForBalance when wallet.publicKey changes
  useEffect(() => {
    setPublicKeyForBalance(wallet.publicKey);
  }, [wallet.publicKey]);

  // Fetch balances with our useGetAllBalances hook
  const { data: balances, isLoading: isLoadingBalances } = useGetAllBalances({
    address: publicKeyForBalance,
  });

  // Format the wallet address for display using the utility function
  const formattedAddress = wallet.publicKey
    ? shortenAddress(wallet.publicKey.toString(), 4, 4)
    : '';

  // Function to copy wallet address to clipboard
  const handleCopyWalletAddress = () => {
    if (wallet.publicKey) {
      copyToClipboard(wallet.publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // Function to navigate to fund wallet page
  const navigateToFundWallet = () => {
    router.push('/fund-wallet');
  };

  return (
    <header className="md:px-6 px-2 mx-auto py-4 flex items-center justify-between h-[66px] bg-gray-800/40 backdrop-blur-sm">
      {/* Logo Section */}
      <Link href="/">
        <div className="flex items-center gap-2">
          <Image
            src="/fabricRadarlogo.png"
            alt="Logo"
            width={64}
            height={64}
            className="w-16 h-16"
          />
          <span className="font-bold text-lg hidden sm:block">Fabricradar</span>
          <span className="font-bold text-lg sm:hidden">FR</span>
        </div>
      </Link>

      {/* Navigation and Button Section */}
      <div className="flex items-center gap-6">
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#"
            className="text-sm hover:text-cyan-400 transition-colors"
          >
            Discover
          </Link>
          <Link
            href="#"
            className="text-sm hover:text-cyan-400 transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#"
            className="text-sm hover:text-cyan-400 transition-colors"
          >
            Marketplace
          </Link>
          {authenticated && wallet.connected && (
            <Link
              href="/fund-wallet"
              className="text-sm flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              Fund Wallet
            </Link>
          )}
        </nav>

        {/* Wallet/Connect Button */}
        {authenticated && wallet.connected && wallet.publicKey ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 text-white"
              >
                <Wallet className="h-5 w-5" />
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 bg-gray-800 border-gray-700 text-white"
            >
              {/* Wallet Balance */}
              <DropdownMenuItem className="flex flex-col items-start">
                <span className="text-sm font-medium">Wallet Balance</span>
                {isLoadingBalances ? (
                  <div className="flex items-center text-sm mt-1">
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  balances && (
                    <div className="flex flex-col mt-1">
                      <span>{balances.sol.toFixed(2)} SOL</span>
                      {balances.usdc > 0 && (
                        <span className="text-blue-300">
                          {balances.usdc.toFixed(2)} USDC
                        </span>
                      )}
                    </div>
                  )
                )}
              </DropdownMenuItem>

              {/* Fund Wallet */}
              <DropdownMenuItem
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                onClick={navigateToFundWallet}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Fund Wallet
              </DropdownMenuItem>

              {/* Order Notifications */}
              <div className="flex items-center gap-1">
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700">
                  <OrderNotifications />
                </DropdownMenuItem>

                {/* Auth Navigation */}
                <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700">
                  <AuthNav />
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 text-xs md:text-base ml-auto"
            onClick={login}
            disabled={disableLogin}
          >
            <span className="hidden sm:block">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
