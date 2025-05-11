'use client';

import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '@/components/header/header';
import { TailorNav } from '@/components/tailor/tailor-nav';
import BackgroundEffect from '@/components/background-effect/background-effect';

export default function TailorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  // Redirect if not authenticated or not a tailor
  if (!isLoading && (!user || user.accountType !== 'TAILOR')) {
    redirect('/');
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-cyan-500" />
            <p className="mt-4 text-white text-lg">
              Loading tailor dashboard...
            </p>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-cyan-500" />
            <p className="mt-4 text-white text-lg">
              Verifying tailor account...
            </p>
          </div>
        </div>
      ) : (
        <div className="h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
          <BackgroundEffect />
          <div className="w-full pl-[50px] bg-gray-800/40">
            <Header />
          </div>
          <div
            className="w-full grid lg:grid-cols-[256px,1fr] grid-cols-1 overflow-hidden"
            style={{ height: 'calc(100vh - 66px)' }}
          >
            {/* Navigation collapses for smaller screens */}
            <TailorNav />
            <div className="w-full h-full overflow-y-auto">
              <div className="px-4 sm:px-6 py-5">{children}</div>
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
}
