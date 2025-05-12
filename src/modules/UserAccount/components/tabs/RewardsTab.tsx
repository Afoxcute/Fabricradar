'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerRewards } from '@/components/rewards/customer-rewards';
import { Button } from '@/components/ui/button';
import { ConfettiAnimation } from '@/components/ConfettiAnimation/ConfettiAnimation';
import { GiftAnimation } from '@/components/GiftAnimation/GiftAnimation';

const RewardsTab: React.FC = () => {
  const [showInitialAnimation, setShowInitialAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show the gift animation when the page loads
    setShowInitialAnimation(true);

    // Show confetti after the gift animation completes
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Confetti animation */}
      <GiftAnimation
        show={showInitialAnimation}
        onComplete={() => setShowInitialAnimation(false)}
      />
      <ConfettiAnimation active={showConfetti} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Rewards</h1>
        {/* <Link href="/rewards">
          <Button
            variant="outline"
            className="text-sm text-cyan-400 border-cyan-400/30 hover:bg-cyan-950/30"
          >
            Browse All Rewards
          </Button>
        </Link> */}
      </div>
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
        <CustomerRewards />
      </div>
    </div>
  );
};

export default RewardsTab;
