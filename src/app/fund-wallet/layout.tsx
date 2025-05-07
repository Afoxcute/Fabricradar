'use client';

import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import Header from '@/components/header/header';
import { TailorNav } from '@/components/tailor/tailor-nav';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Footer from '@/components/footer/footer';

export default function FundWalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Check if user is a tailor
  const isTailor = user?.accountType === 'TAILOR';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      {isTailor ? (
        // Render with tailor navigation if user is a tailor
        <div className="flex">
          <TailorNav />
          <div className="ml-64 flex-1 relative z-10">
            {children}
          </div>
        </div>
      ) : (
        // Regular layout for non-tailor users
        <div>
          {children}
        </div>
      )}
      
      <div className={isTailor ? 'ml-64' : ''}>
        <Footer />
      </div>
    </div>
  );
} 