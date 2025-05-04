'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '../solana/privy-solana-adapter'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../ui/ui-layout'
import { UserProfileForm, UserProfileFormValues } from './user-profile-form'
import { useRouter } from 'next/navigation'
import BackgroundEffect from '../background-effect/background-effect'
import { useAuth } from '@/providers/auth-provider'

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

  const handleProfileSuccess = () => {
    console.log('Profile updated successfully')
    // Redirect to home after profile completion
    router.push('/')
  }

  // Convert user data to the format expected by UserProfileForm
  const getUserFormValues = (): Partial<UserProfileFormValues> | undefined => {
    if (!user) {
      // Return defaults when no user is available but wallet is connected
      if (connected && publicKey) {
        return {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          walletAddress: publicKey.toString(),
          role: 'user', // Default role
        };
      }
      return undefined;
    }
    
    // Map existing User fields and provide default values for new fields
    return {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      walletAddress: user.walletAddress ?? (publicKey ? publicKey.toString() : undefined),
      role: 'user', // Default role since it's not in the User type
      businessName: '',
      specialization: '',
      businessDescription: ''
    };
  }

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to view or update your profile.
          </p>
          <div className="flex justify-center">
            <WalletButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white">
      <BackgroundEffect />
      <AppHero
        title="User Profile"
        subtitle="Manage your personal information and settings"
      />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {connected ? (
          showProfileForm ? (
            <div className="bg-gray-900/30 backdrop-blur-sm shadow-xl max-w-lg mx-auto p-6 rounded-xl">
              <UserProfileForm 
                initialValues={getUserFormValues()}
                walletAddress={publicKey?.toString()}
                onSuccess={handleProfileSuccess}
              />
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