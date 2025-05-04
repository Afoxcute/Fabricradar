'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ChevronRight, Copy, Check, Loader2 } from 'lucide-react';
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

const Header = () => {
  const { ready, authenticated, login } = usePrivy();
  const wallet = useWallet();
  const { user } = useAuth();
  const router = useRouter();
  const disableLogin = !ready || (ready && authenticated);
  const [copied, setCopied] = useState(false);
  
  // Create a state to safely store the PublicKey for the balance query
  const [publicKeyForBalance, setPublicKeyForBalance] = useState<PublicKey | null>(null);
  
  // Update the publicKeyForBalance when wallet.publicKey changes
  useEffect(() => {
    setPublicKeyForBalance(wallet.publicKey);
  }, [wallet.publicKey]);
  
  // Fetch balances with our useGetAllBalances hook
  const { data: balances, isLoading: isLoadingBalances } = useGetAllBalances({ 
    address: publicKeyForBalance
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

  return (
    <header className="max-w-[1440px] mx-auto py-4 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Image
          src="/placeholder.svg"
          alt="Logo"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="font-bold text-lg">Tailor Module</span>
      </div>
      <div className="flex items-center gap-6">
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
        </nav>
        
        {authenticated && wallet.connected && wallet.publicKey ? (
          <div className="flex items-center gap-2">
            {/* Wallet Balance Display */}
            <div className="text-sm bg-gray-800/50 rounded-lg px-3 py-2">
                {isLoadingBalances ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span>Loading...</span>
                </div>
                ) : (
                <div className="flex items-center gap-2">
                    {balances && (
                      <>
                        <span>{balances.sol.toFixed(2)} SOL</span>
                        {balances.usdc > 0 && (
                          <span className="text-blue-300">{balances.usdc.toFixed(2)} USDC</span>
                        )}
                      </>
              )}
                  </div>
                )}
              </div>
            
            {/* Auth Navigation */}
            <AuthNav />
          </div>
        ) : (
          <Button
            variant="outline"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            onClick={login}
            disabled={disableLogin}
          >
            Connect Wallet
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
