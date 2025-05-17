'use client';

import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-cyan-500" />
          <p className="mt-4 text-white text-lg">Loading tailor dashboard...</p>
        </div>
      </div>
    }>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-cyan-500" />
            <p className="mt-4 text-white text-lg">Verifying tailor account...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </Suspense>
  );
} 