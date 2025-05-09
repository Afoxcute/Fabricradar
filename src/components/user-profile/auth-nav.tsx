'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Scissors,
  ShoppingBag,
  User,
  Wallet,
} from 'lucide-react';

import { useAuth } from '@/providers/auth-provider';
import { useWallet } from '../solana/privy-solana-adapter';
import { shortenAddress } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AuthNav() {
  const { user, logout } = useAuth();
  const { publicKey } = useWallet();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 text-white"
        >
          {user?.accountType === 'TAILOR' ? (
            <Scissors className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span>
            {user?.firstName ||
              (publicKey ? shortenAddress(publicKey.toString()) : 'Account')}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-gray-800 border-gray-700 text-white"
      >
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
                  <Badge
                    variant="outline"
                    className={`${
                      user.accountType === 'TAILOR'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}
                  >
                    {user.accountType === 'TAILOR' ? 'Tailor' : 'Customer'}
                  </Badge>
                </div>
              )}
            </div>
            <DropdownMenuItem
              className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              onClick={() => navigateTo('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Your Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              onClick={() => navigateTo('/orders')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              My Orders
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              onClick={() => navigateTo('/rewards')}
            >
              <Award className="h-4 w-4 mr-2" />
              Rewards & Offers
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              onClick={() => navigateTo('/fund-wallet')}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Fund Wallet
            </DropdownMenuItem>
            {user.accountType === 'TAILOR' && (
              <DropdownMenuItem
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
                onClick={() => navigateTo('/tailor/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Tailor Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/auth/signin"
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              >
                Sign In
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/auth/signup"
                className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer"
              >
                Create Account
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
