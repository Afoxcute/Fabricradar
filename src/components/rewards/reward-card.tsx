'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import {
  Tag,
  Clipboard,
  CheckCircle,
  Percent,
  Gift,
  BarChart,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { RewardCelebration } from '../RewardCelebration/RewardCelebration';

// Define RewardType
type RewardType = 'DISCOUNT' | 'FREE_ITEM' | 'POINTS' | 'PRIORITY';

interface RewardCardProps {
  reward: {
    id: number;
    name: string;
    description: string;
    type: RewardType;
    value: number;
    minSpend?: number | null;
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
    imageUrl?: string | null;
    redemptionCount: number;
    maxRedemptions?: number | null;
    tailor?: {
      id: number;
      firstName: string | null;
      lastName: string | null;
    };
  };
  compact?: boolean;
}

export function RewardCard({ reward, compact = false }: RewardCardProps) {
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Redeem a reward
  const redeemMutation = api.rewards.redeemReward.useMutation({
    onSuccess: () => {
      setShowCelebration(true);
      // Toast is now shown after celebration closes
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to redeem reward');
    },
  });

  // Get icon based on reward type
  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case 'DISCOUNT':
        return <Percent className="h-5 w-5 text-green-500" />;
      case 'FREE_ITEM':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'POINTS':
        return <BarChart className="h-5 w-5 text-blue-500" />;
      case 'PRIORITY':
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  // Format tailor name
  const getTailorName = (tailor?: {
    firstName: string | null;
    lastName: string | null;
  }) => {
    if (!tailor) return 'Unknown Tailor';
    return (
      `${tailor.firstName || ''} ${tailor.lastName || ''}`.trim() ||
      'Anonymous Tailor'
    );
  };

  // Copy reward code to clipboard
  const copyRewardCode = () => {
    // In a real app, this would be a unique code generated for this reward
    const rewardCode = `REWARD-${reward.id}-${reward.type.substring(0, 3)}`;

    navigator.clipboard
      .writeText(rewardCode)
      .then(() => {
        setCopiedCode(true);
        toast.success('Reward code copied to clipboard!');

        // Reset after 3 seconds
        setTimeout(() => {
          setCopiedCode(false);
        }, 3000);
      })
      .catch(() => {
        toast.error('Failed to copy code');
      });
  };

  // Redeem reward
  const handleRedeemReward = () => {
    if (!user?.id) {
      toast.error('You need to be logged in to redeem rewards');
      return;
    }

    redeemMutation.mutate({ rewardId: reward.id });
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle celebration close
  const handleCelebrationClose = () => {
    setShowCelebration(false);
    toast.success('Reward redeemed successfully!');
  };

  // Compact view for dashboard
  if (compact) {
    return (
      <>
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-800 rounded-lg p-4 hover:bg-gray-800/60 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-700">
                {getRewardIcon(reward.type)}
              </div>
              <div>
                <h3 className="font-medium text-white">{reward.name}</h3>
                <p className="text-xs text-gray-400">
                  {getTailorName(reward.tailor)}
                </p>
              </div>
            </div>
            <Badge
              className={
                reward.type === 'DISCOUNT'
                  ? 'bg-green-600'
                  : reward.type === 'FREE_ITEM'
                    ? 'bg-purple-600'
                    : reward.type === 'POINTS'
                      ? 'bg-blue-600'
                      : 'bg-amber-600'
              }
            >
              {reward.type === 'DISCOUNT'
                ? `${reward.value}% OFF`
                : reward.type === 'FREE_ITEM'
                  ? `${reward.value} FREE`
                  : reward.type === 'POINTS'
                    ? `${reward.value} PTS`
                    : 'PRIORITY'}
            </Badge>
          </div>

          <div className="mt-2 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-gray-700 text-gray-400 hover:bg-gray-800"
              onClick={copyRewardCode}
            >
              {copiedCode ? (
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <Clipboard className="h-3 w-3 mr-1" />
              )}
              {copiedCode ? 'Copied' : 'Copy Code'}
            </Button>

            <p className="text-xs text-gray-500">
              Expires {formatDate(reward.endDate)}
            </p>
          </div>
        </div>

        <RewardCelebration
          isOpen={showCelebration}
          onClose={handleCelebrationClose}
          rewardName={reward.name}
          rewardType={reward.type}
          rewardValue={reward.value}
        />
      </>
    );
  }

  // Full view
  return (
    <>
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 mr-3">
              {getRewardIcon(reward.type)}
            </div>
            <h3 className="font-medium">{reward.name}</h3>
          </div>
          <Badge
            className={
              reward.type === 'DISCOUNT'
                ? 'bg-green-600'
                : reward.type === 'FREE_ITEM'
                  ? 'bg-purple-600'
                  : reward.type === 'POINTS'
                    ? 'bg-blue-600'
                    : 'bg-amber-600'
            }
          >
            {reward.type === 'DISCOUNT'
              ? 'Discount'
              : reward.type === 'FREE_ITEM'
                ? 'Free Item'
                : reward.type === 'POINTS'
                  ? 'Points'
                  : 'Priority'}
          </Badge>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-400 mb-3">{reward.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-500">Value</p>
              <p className="font-medium">
                {reward.type === 'DISCOUNT'
                  ? `${reward.value}% off`
                  : reward.type === 'POINTS'
                    ? `${reward.value} points`
                    : reward.type === 'FREE_ITEM'
                      ? `${reward.value} free items`
                      : 'Priority service'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Min. Spend</p>
              <p className="font-medium">
                {reward.minSpend ? `$${reward.minSpend}` : 'None'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Expires</p>
              <p className="font-medium">{formatDate(reward.endDate)}</p>
            </div>

            <div>
              <p className="text-gray-500">Tailor</p>
              <p className="font-medium truncate">
                {getTailorName(reward.tailor)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-1"
              onClick={handleRedeemReward}
              disabled={
                redeemMutation.isPending &&
                redeemMutation.variables?.rewardId === reward.id
              }
            >
              {redeemMutation.isPending &&
              redeemMutation.variables?.rewardId === reward.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Redeeming...</span>
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4" />
                  <span>Redeem</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 flex items-center justify-center gap-1"
              onClick={copyRewardCode}
            >
              {copiedCode ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <RewardCelebration
        isOpen={showCelebration}
        onClose={handleCelebrationClose}
        rewardName={reward.name}
        rewardType={reward.type}
        rewardValue={reward.value}
      />
    </>
  );
}
