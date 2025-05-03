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

const Header = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const wallet = useWallet();
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

  // Format the wallet address for display
  const formattedAddress = wallet.publicKey
    ? `${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey
        .toString()
        .slice(-4)}`
    : '';

  // Function to copy wallet address to clipboard
  const copyWalletAddress = () => {
    if (wallet.publicKey) {
      navigator.clipboard
        .writeText(wallet.publicKey.toString())
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
        .catch((err) => {
          console.error('Could not copy wallet address: ', err);
        });
    }
  };

  return (
    <header className="max-w-[1440px] mx-auto py-4 flex items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/placeholder.svg"
          alt="Logo"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="font-bold text-lg">Tailor Module</span>
      </Link>
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
              {formattedAddress}
              <div className="ml-2 flex items-center">
                {isLoadingBalances ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <div className="flex items-center gap-1 text-xs opacity-70">
                    {balances && (
                      <>
                        <span>{balances.sol.toFixed(2)} SOL</span>
                        {balances.usdc > 0 && (
                          <span className="text-blue-300">
                            {balances.usdc.toFixed(2)} USDC
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64"
            >
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li className="cursor-pointer">
                <div
                  onClick={copyWalletAddress}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </span>
                    <span className="truncate">
                      {wallet.publicKey?.toString()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </div>
              </li>
              {wallet.publicKey && (
                <li className="px-2 py-2">
                  <TokenBalances
                    address={wallet.publicKey}
                    showDetailed={true}
                  />
                </li>
              )}
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
