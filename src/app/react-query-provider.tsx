'use client'

import React, { ReactNode } from 'react'
import { TRPCReactProvider } from '@/trpc/react'

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <TRPCReactProvider>
      {children}
    </TRPCReactProvider>
  )
}
