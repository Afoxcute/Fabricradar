import React from 'react';
import {
  Package,
  User,
  CreditCard,
  Award,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface SidebarProps {
  activeTab: 'orders' | 'profile' | 'wallet' | 'rewards' | 'dashboard';
  setActiveTab: (
    tab: 'orders' | 'profile' | 'wallet' | 'rewards' | 'dashboard'
  ) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
    { label: 'My Orders', icon: Package, tab: 'orders' },
    { label: 'My Rewards', icon: Award, tab: 'rewards' },
    { label: 'Profile', icon: User, tab: 'profile' },
    { label: 'Wallet', icon: CreditCard, tab: 'wallet' },
  ];

  return (
    <div className="w-full md:w-64 h-full">
      <div className="bg-gray-800/40 backdrop-blur-sm p-6 h-full">
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
              onClick={() =>
                setActiveTab(tab as 'orders' | 'profile' | 'wallet' | 'rewards')
              }
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
    </div>
  );
};

export default Sidebar;
