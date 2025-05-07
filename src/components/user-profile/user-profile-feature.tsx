'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import Header from '@/components/header/header'
import Footer from '@/components/footer/footer'
import BackgroundEffect from '@/components/background-effect/background-effect'
import { UserProfileForm, UserProfileFormValues, UserProfileCard, UserStatsCard } from '@/components/user-profile'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UserProfileFeature() {
  const router = useRouter()
  const { user, refreshUserData } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <p className="text-xl text-amber-400 mb-4">You Need to Sign In</p>
            <p className="text-gray-400 mb-6">Please sign in to view your profile</p>
            <Button onClick={() => router.push('/')}>Go to Home Page</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const handleProfileSuccess = () => {
    // Refresh user data after successful update
    if (user?.id) {
      refreshUserData(user.id)
    }
  }

  const getUserFormValues = (): Partial<UserProfileFormValues> | undefined => {
    if (!user) return undefined
    
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Account</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar with profile card and stats */}
          <div className="md:col-span-1 space-y-6">
            <UserProfileCard showEditButton={false} />
            <UserStatsCard />
          </div>
          
          {/* Main content with form */}
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
            
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
              <UserProfileForm 
                initialValues={getUserFormValues()} 
                onSuccess={handleProfileSuccess} 
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 