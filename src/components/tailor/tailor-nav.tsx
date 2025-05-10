'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Scissors,
  Users,
  Settings,
  Award,
  Menu,
  X,
} from 'lucide-react';

export function TailorNav() {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard',
      href: '/tailor/dashboard',
    },
    {
      icon: <ShoppingBag size={20} />,
      label: 'Orders',
      href: '/tailor/orders',
    },
    { icon: <Scissors size={20} />, label: 'Designs', href: '/tailor/designs' },
    { icon: <Award size={20} />, label: 'Rewards', href: '/tailor/rewards' },
    {
      icon: <Users size={20} />,
      label: 'Customers',
      href: '/tailor/customers',
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      href: '/tailor/settings',
    },
  ];

  // Check if the current path starts with the nav item's href
  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900 text-white"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full z-40 bg-gray-900/70 backdrop-blur-sm border-r border-gray-800 px-4 py-6 transform transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <h2 className="text-xl font-bold text-white mb-6 px-4">
          Tailor Portal
        </h2>

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
                onClick={() => setSidebarOpen(false)} // Close menu when a link is clicked
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

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </>
  );
}
