'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '../solana/privy-solana-adapter'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../ui/ui-layout'
import { UserProfileForm, UserProfileFormValues } from './user-profile-form'
import { useRouter } from 'next/navigation'
import BackgroundEffect from '../background-effect/background-effect'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Scissors } from 'lucide-react'

export default function UserProfileFeature() {
  const { publicKey, connected } = useWallet()
  const { user, refreshUserData } = useAuth()
  const [showProfileForm, setShowProfileForm] = useState(false)
  const router = useRouter()

  // Check if profile is already completed
  useEffect(() => {
    if (connected && publicKey) {
      if (user && user.firstName && user.lastName && (user.email || user.phone)) {
        // Profile already exists and is complete, redirect to home
        router.push('/')
      } else {
        // No complete profile exists, show form
        setShowProfileForm(true)
      }
    }
  }, [connected, publicKey, router, user])

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/auth/login')
    }
  }, [user, router])

  const handleProfileSuccess = () => {
    if (user?.id) {
      refreshUserData(user.id)
    }
  }

  // Convert user data to the format expected by UserProfileForm
  const getUserFormValues = (): Partial<UserProfileFormValues> | undefined => {
    if (!user) return undefined;

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    };
  };

  // If user not loaded yet, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white">
      <BackgroundEffect />
      <AppHero
        title="Complete Your Profile"
        subtitle="Please provide your information to continue using the platform."
      >
        {!connected && (
          <div className="mt-6">
            <WalletButton />
          </div>
        )}
      </AppHero>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {connected ? (
          showProfileForm ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Your Profile</h1>
                  <p className="text-gray-400 mt-1">
                    Manage your personal information
                  </p>
                </div>
                
                {/* Show View Designs button for tailor accounts */}
                {user.accountType === 'TAILOR' && (
                  <Button
                    onClick={() => router.push('/tailor/designs')}
                    className="bg-cyan-900/30 text-cyan-500 hover:bg-cyan-800/30 border border-cyan-900 flex items-center gap-2"
                  >
                    <Scissors size={16} />
                    <span>View Your Designs</span>
                  </Button>
                )}
              </div>

              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <UserProfileForm 
                  initialValues={getUserFormValues()}
                  walletAddress={publicKey?.toString()}
                  onSuccess={handleProfileSuccess}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="animate-pulse">
                <div className="h-12 w-12 rounded-full border-4 border-t-cyan-500 border-b-transparent border-l-transparent border-r-transparent animate-spin" />
              </div>
            </div>
          )
        ) : (
          <div className="text-center">
            <p className="mb-6">Connect your wallet to continue</p>
            <WalletButton />
          </div>
        )}
      </div>
    </div>
  )
} 