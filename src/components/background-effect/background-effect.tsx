'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  pulse: boolean;
  pulseSpeed: number;
  twinkleSpeed: number;
}

const BackgroundEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize stars
    const initStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 10000); // Dynamic star count based on screen size
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5, // Size between 0.5 and 2.5
          opacity: Math.random() * 0.7 + 0.3, // Opacity between 0.3 and 1
          pulse: Math.random() > 0.7, // 30% of stars will pulse
          pulseSpeed: (Math.random() * 0.02) + 0.005, // Different pulse speeds
          twinkleSpeed: Math.random() * 0.01 + 0.003 // Different twinkle speeds
        });
      }
      
      starsRef.current = stars;
    };

    // Draw a single star
    const drawStar = (star: Star, time: number) => {
      if (!ctx) return;
      
      // Calculate opacity based on time for twinkling effect
      let opacity = star.opacity;
      if (star.pulse) {
        opacity = star.opacity * (0.5 + 0.5 * Math.sin(time * star.pulseSpeed));
      }
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(142, 223, 255, ${opacity})`;
      ctx.shadowColor = 'rgba(142, 223, 255, 0.5)';
      ctx.shadowBlur = 10 * star.size;
      ctx.fill();
      ctx.closePath();
      
      // Reset shadow for performance
      ctx.shadowBlur = 0;
    };

    // Draw larger glowing circles
    const drawGlowCircles = (time: number) => {
      if (!ctx) return;
      
      const circleCount = 5;
      
      for (let i = 0; i < circleCount; i++) {
        const x = canvas.width * (0.2 + 0.6 * (i / (circleCount - 1)));
        const y = canvas.height * (0.3 + 0.4 * Math.sin(time * 0.0001 + i));
        
        const radius = 20 + 10 * Math.sin(time * 0.0002 + i);
        const opacity = 0.1 + 0.05 * Math.sin(time * 0.0005 + i);
        
        // Draw outer glow
        const gradient = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
        gradient.addColorStop(0, `rgba(64, 190, 255, ${opacity})`);
        gradient.addColorStop(1, 'rgba(64, 190, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
      }
    };

    // Draw animated nebula effects
    const drawNebulae = (time: number) => {
      if (!ctx) return;
      
      const nebulaCount = 2;
      
      for (let i = 0; i < nebulaCount; i++) {
        const x = canvas.width * (0.3 + 0.4 * Math.sin(time * 0.00005 + i));
        const y = canvas.height * (0.3 + 0.4 * Math.cos(time * 0.00004 + i));
        
        const radius = canvas.width * 0.3;
        const opacity = 0.05 + 0.01 * Math.sin(time * 0.0002 + i);
        
        // Create gradient for nebula
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // Different colors for each nebula
        if (i % 2 === 0) {
          gradient.addColorStop(0, `rgba(120, 100, 220, ${opacity * 1.5})`);
          gradient.addColorStop(0.5, `rgba(64, 30, 130, ${opacity})`);
        } else {
          gradient.addColorStop(0, `rgba(30, 120, 180, ${opacity * 1.5})`);
          gradient.addColorStop(0.5, `rgba(20, 60, 100, ${opacity})`);
        }
        
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
      }
    };

    // Main animation loop
    const animate = (time: number) => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background elements from back to front
      drawNebulae(time);
      drawGlowCircles(time);
      
      // Draw all stars
      starsRef.current.forEach(star => drawStar(star, time));
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      initStars();
    };

    // Initial setup
    setCanvasSize();
    initStars();
    animationRef.current = requestAnimationFrame(animate);
    
    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
};

export default BackgroundEffect;
