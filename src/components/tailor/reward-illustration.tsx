'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function RewardIllustration() {
  return (
    <div className="relative w-full h-64 mx-auto">
      {/* Main reward badge */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.3
        }}
      >
        <motion.div
          className="w-28 h-28 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="text-amber-900 text-4xl font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <motion.path 
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                stroke="#7C2D12" 
                strokeWidth="2" 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.9, duration: 1 }}
              />
              <motion.path 
                d="M12 6V4M12 20V18M6 12H4M20 12H18M17.7 6.3L16.3 7.7M7.7 17.7L6.3 16.3M17.7 17.7L16.3 16.3M7.7 6.3L6.3 7.7" 
                stroke="#7C2D12" 
                strokeWidth="2" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Stars around the badge */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const x = Math.cos(angle) * 80;
        const y = Math.sin(angle) * 80;
        const delay = 1 + (i * 0.1);
        
        return (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-yellow-300 rounded-full"
            style={{ 
              left: `calc(50% + ${x}px)`, 
              top: `calc(50% + ${y}px)`,
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 1], 
              opacity: [0, 1, 0.8] 
            }}
            transition={{ 
              delay,
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1
            }}
          />
        );
      })}
      
      {/* Floating coins */}
      {[...Array(5)].map((_, i) => {
        const randomX = (Math.random() * 200) - 100;
        const randomDelay = 1.5 + (Math.random() * 1);
        
        return (
          <motion.div
            key={`coin-${i}`}
            className="absolute w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full flex items-center justify-center border-2 border-yellow-500"
            style={{ 
              left: `calc(50% + ${randomX}px)`, 
              top: '70%',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
            }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: [100, -100],
              opacity: [0, 1, 0],
              x: randomX + (Math.random() * 40 - 20),
            }}
            transition={{ 
              delay: randomDelay,
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3
            }}
          >
            <span className="text-amber-800 text-xs font-bold">+{Math.floor(Math.random() * 50) + 10}</span>
          </motion.div>
        );
      })}
      
      {/* Sparkle effects */}
      {[...Array(20)].map((_, i) => {
        const randomX = (Math.random() * 300) - 150;
        const randomY = (Math.random() * 300) - 150;
        const randomSize = Math.random() * 3 + 1;
        const randomDelay = Math.random() * 3;
        
        return (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ 
              left: `calc(50% + ${randomX}px)`, 
              top: `calc(50% + ${randomY}px)`,
              width: `${randomSize}px`,
              height: `${randomSize}px`,
              boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)'
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{ 
              delay: randomDelay,
              duration: 1 + Math.random(),
              repeat: Infinity,
              repeatDelay: Math.random() * 4
            }}
          />
        );
      })}
    </div>
  );
} 