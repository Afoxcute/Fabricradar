import React from 'react';
import Link from 'next/link';
import { CustomerRewards } from '@/components/rewards/customer-rewards';
import { Button } from '@/components/ui/button';

const RewardsTab: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">My Rewards</h1>
      <Link href="/rewards">
        <Button
          variant="outline"
          className="text-sm text-cyan-400 border-cyan-400/30 hover:bg-cyan-950/30"
        >
          Browse All Rewards
        </Button>
      </Link>
    </div>
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
      <CustomerRewards />
    </div>
  </div>
);

export default RewardsTab;
