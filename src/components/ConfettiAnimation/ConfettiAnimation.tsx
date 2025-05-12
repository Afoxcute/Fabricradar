'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

type ConfettiProps = {
  active?: boolean;
  duration?: number;
  className?: string;
  onComplete?: () => void;
};

export function ConfettiAnimation({
  active = false,
  duration = 3000,
  className,
  onComplete,
}: ConfettiProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (active && !isAnimating) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, isAnimating, onComplete]);

  if (!isAnimating) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 w-full h-full z-50 pointer-events-none',
        className
      )}
    >
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.2}
        colors={[
          '#00BFFF',
          '#FF1493',
          '#FFFF00',
          '#FF4500',
          '#32CD32',
          '#9400D3',
        ]}
      />
    </div>
  );
}
