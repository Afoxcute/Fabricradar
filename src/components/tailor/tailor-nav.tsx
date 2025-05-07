'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Scissors, 
  Users, 
  Settings,
  Wallet
} from 'lucide-react';

export function TailorNav() {
  const pathname = usePathname();
  
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/tailor/dashboard' },
    { icon: <ShoppingBag size={20} />, label: 'Orders', href: '/tailor/orders' },
    { icon: <Scissors size={20} />, label: 'Designs', href: '/tailor/designs' },
    { icon: <Users size={20} />, label: 'Customers', href: '/tailor/customers' },
    { icon: <Wallet size={20} />, label: 'Fund Wallet', href: '/tailor/fund-wallet' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/tailor/settings' },
  ];
  
  // Check if the current path starts with the nav item's href
  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  
  return (
    <div className="bg-gray-900/70 backdrop-blur-sm border-r border-gray-800 h-full w-64 fixed left-0 top-[64px] px-4 py-6">
      <h2 className="text-xl font-bold text-white mb-6 px-4">Tailor Portal</h2>
      
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-500' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && (
                <div className="w-1 h-6 bg-cyan-500 absolute right-0 rounded-l-full"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 