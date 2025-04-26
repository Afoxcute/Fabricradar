'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '../solana/privy-solana-adapter';
import Image from 'next/image';
import { useGetUSDCBalance } from '../account/account-data-access';
import { PublicKey } from '@solana/web3.js';

const Header = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const wallet = useWallet();
  const disableLogin = !ready || (ready && authenticated);
  
  // Create a state to safely store the PublicKey for the balance query
  const [publicKeyForBalance, setPublicKeyForBalance] = useState<PublicKey | null>(null);
  
  // Update the publicKeyForBalance when wallet.publicKey changes
  useEffect(() => {
    setPublicKeyForBalance(wallet.publicKey);
  }, [wallet.publicKey]);
  
  // Always call useGetUSDCBalance, but with a null check inside
  const usdcBalanceQuery = useGetUSDCBalance({ 
    address: publicKeyForBalance || new PublicKey('11111111111111111111111111111111')
  });
  
  // Only show balance when we have a real public key
  const showBalance = wallet.connected && publicKeyForBalance !== null;
  
  // Format the USDC balance for display
  const formattedBalance = showBalance && usdcBalanceQuery.data !== undefined 
    ? `${usdcBalanceQuery.data.toFixed(2)} USDC` 
    : '';

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
          <div className="dropdown dropdown-end">
            <Button 
              variant="outline" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
              tabIndex={0}
            >
              {`${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey.toString().slice(-4)}`}
              {showBalance && (
                usdcBalanceQuery.isLoading ? (
                  <span className="ml-2 text-xs opacity-70">Loading...</span>
                ) : formattedBalance ? (
                  <span className="ml-2 text-xs opacity-70">{formattedBalance}</span>
                ) : null
              )}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <button onClick={() => wallet.disconnect()}>Disconnect</button>
              </li>
            </ul>
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
