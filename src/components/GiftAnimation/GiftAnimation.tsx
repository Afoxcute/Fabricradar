'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';

interface GiftAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function GiftAnimation({ show, onComplete }: GiftAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [-15, 15, 0],
              y: [0, -20, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.8,
              times: [0, 0.6, 1],
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1.5,
                }}
              >
                <Gift className="h-16 w-16 text-white" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 1.5],
                y: [0, -60],
              }}
              transition={{
                delay: 0.3,
                duration: 1.5,
              }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full text-center"
            >
              <div className="text-2xl font-bold text-white drop-shadow-lg">
                New Reward!
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                delay: 0.5,
                duration: 2,
              }}
              className="absolute -inset-8"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
