'use client';

import React, {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from 'react';
import {
  Package,
  User,
  CreditCard,
  Award,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  LucideProps,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface SidebarProps {
  activeTab: 'orders' | 'profile' | 'wallet' | 'rewards' | 'dashboard';
  setActiveTab: (
    tab: 'orders' | 'profile' | 'wallet' | 'rewards' | 'dashboard'
  ) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setSidebarOpen,
}) => {
  const { user, logout } = useAuth();

  const sidebarItems: {
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >;
    tab: 'orders' | 'profile' | 'wallet' | 'rewards' | 'dashboard';
  }[] = [
    { label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
    { label: 'My Orders', icon: Package, tab: 'orders' },
    { label: 'My Rewards', icon: Award, tab: 'rewards' },
    { label: 'Profile', icon: User, tab: 'profile' },
    { label: 'Wallet', icon: CreditCard, tab: 'wallet' },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900 text-white"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full z-40 bg-gray-800/40 backdrop-blur-sm p-6 transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : 'Your Account'}
            </h2>
            <p className="text-sm text-gray-400">{user?.accountType}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map(({ label, icon: Icon, tab }) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSidebarOpen(false); // Close sidebar on selection
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-cyan-600/20 text-cyan-400'
                  : 'hover:bg-gray-700/50 text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-2 rounded-md text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
