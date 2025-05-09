import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

const WalletTab: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Wallet</h1>
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Address</h2>
        {user?.walletAddress ? (
          <div>
            <p className="text-gray-400 text-sm mb-2">Connected Wallet:</p>
            <p className="font-mono bg-gray-900 p-3 rounded-md overflow-auto">
              {user.walletAddress}
            </p>
          </div>
        ) : (
          <div className="text-center p-6">
            <CreditCard className="h-10 w-10 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 mb-4">No wallet connected</p>
            <Button>Connect Wallet</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletTab;
