'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Award, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfettiAnimation } from '../ConfettiAnimation/ConfettiAnimation';

interface RewardCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  rewardName: string;
  rewardType: string;
  rewardValue: number | string;
}

export function RewardCelebration({
  isOpen,
  onClose,
  rewardName,
  rewardType,
  rewardValue,
}: RewardCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
    }
  }, [isOpen]);

  const getRewardIcon = () => {
    switch (rewardType) {
      case 'DISCOUNT':
        return <Award className="h-12 w-12 text-green-500" />;
      case 'FREE_ITEM':
        return <Gift className="h-12 w-12 text-purple-500" />;
      default:
        return <PartyPopper className="h-12 w-12 text-cyan-500" />;
    }
  };

  const getRewardValueText = () => {
    switch (rewardType) {
      case 'DISCOUNT':
        return `${rewardValue}% OFF`;
      case 'FREE_ITEM':
        return `${rewardValue} FREE ITEM${Number(rewardValue) > 1 ? 'S' : ''}`;
      case 'POINTS':
        return `${rewardValue} POINTS`;
      default:
        return 'SPECIAL REWARD';
    }
  };

  return (
    <>
      <ConfettiAnimation
        active={showConfetti}
        duration={5000}
        onComplete={() => setShowConfetti(false)}
      />

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="relative z-50 w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 shadow-xl"
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg"
                >
                  {getRewardIcon()}
                </motion.div>
              </div>

              <div className="mt-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-gray-300 mb-4">
                    You&apos;ve received a special reward
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6"
                >
                  <h3 className="text-xl font-bold text-white mb-1">
                    {rewardName}
                  </h3>
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-2">
                    {getRewardValueText()}
                  </div>
                  <p className="text-gray-400 text-sm">
                    This reward has been added to your account and is ready to
                    use!
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Awesome, Thanks!
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
