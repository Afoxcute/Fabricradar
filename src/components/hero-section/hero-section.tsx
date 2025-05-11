'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';

const HeroSection = () => {
  const { ready, authenticated, login } = usePrivy();
  const { user } = useAuth();
  const disableLogin = !ready || (ready && authenticated);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroImageRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate mouse position as percentage of screen
      const xPos = (clientX / innerWidth - 0.5) * 10;
      const yPos = (clientY / innerHeight - 0.5) * 10;

      // Apply subtle parallax effect
      heroImageRef.current.style.transform = `translate(${xPos}px, ${yPos}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-500/30"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: ['0%', '100%'],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
            }}
          />
        ))}
      </div>

      <div className="mt-10 grid md:grid-cols-2 grid-cols-1 gap-7 max-w-[1440px] px-4 mx-auto relative z-10">
        <motion.div
          className="w-full flex items-center"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="w-full flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-cyan-950/50 px-4 py-2 rounded-full border border-cyan-800/50 w-fit">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="font-medium text-sm text-cyan-400">
                Web3 Fashion Marketplace
              </span>
            </div>

            <h3 className="font-adLamDisplay md:text-[32px] md:text-2xl text-xl text-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Powered by Web3.
            </h3>

            <h1 className="font-adLamDisplay md:text-[66px] md:leading-[80px] md:text-5xl text-3xl leading-[35px] relative">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Empowering Tailors.
                <br />
                Elevating Fashion.
              </span>
              <div className="absolute -right-8 -top-8 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
            </h1>

            <p className="text-[#D8EFF5] md:text-lg text-base max-w-xl">
              Discover, own, and showcase exclusive tailor-made designs in a
              decentralized fashion marketplace.
            </p>

            <div className="grid sm:grid-cols-2 grid-cols-1 items-center z-30 gap-2">
              {user?.accountType === 'TAILOR' ? (
                <Link href="/tailor/dashboard" className="w-full flex">
                  <Button
                    size="default"
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-none group transition-all duration-300 w-full"
                  >
                    <span>View Dashboard</span>
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link href="/products" className="w-full flex">
                  <Button
                    size="default"
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-none group transition-all duration-300 w-full"
                  >
                    <span>Explore Designs</span>
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}

              {!authenticated && (
                <Button
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                  onClick={login}
                  disabled={disableLogin}
                >
                  Connect Wallet
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-full relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          ref={heroImageRef}
        >
          {/* Glow effect behind image */}
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl transform -translate-y-1/4 translate-x-1/4"></div>

          <div className="relative z-10">
            <Image
              src="/heroImg.png"
              alt="Hero Image"
              width={600}
              height={600}
              className="w-full h-auto drop-shadow-2xl"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Blockchain Partners */}
      <motion.div
        className="mt-16 flex flex-wrap items-center gap-8 md:gap-16 max-w-[1440px] mx-auto justify-between px-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
      >
        {[
          { src: '/solanaLogo.svg', label: 'SOLANA', width: 120 },
          { src: '/superteam.svg', label: 'Superteam', width: 120 },
          { src: '/usdcLogo.png', label: 'USDC', width: 120 },
        ].map((logo, idx) => (
          <motion.div
            key={idx}
            className="flex items-center gap-2 bg-gray-900/30 px-6 py-3 rounded-xl backdrop-blur-sm border border-gray-800/50 hover:border-cyan-800/50 transition-all duration-300"
            whileHover={{
              y: -5,
              boxShadow: '0 10px 25px -5px rgba(0, 201, 255, 0.1)',
            }}
          >
            <div className="w-[120px] h-[50px] flex items-center justify-center relative">
              <Image
                src={logo.src || '/placeholder.svg'}
                alt={logo.label}
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-gray-300">{logo.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HeroSection;
