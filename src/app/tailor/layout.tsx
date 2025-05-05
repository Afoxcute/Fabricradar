'use client';

import { useAuth } from '@/providers/auth-provider';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default function TailorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No immediate redirect here since we handle it in the individual pages
  // This is just a container that can be expanded with common tailor UI elements
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading tailor dashboard...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
} 