"use client";

import BackgroundEffect from "@/components/background-effect/background-effect";
import { UserProfileForm } from "@/components/user-profile/user-profile-form";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden flex items-center justify-center">
      <BackgroundEffect />
      
      <div className="card bg-gray-900/30 backdrop-blur-sm shadow-xl max-w-lg w-full p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
        <UserProfileForm isSignUp={true} />
          </div>
    </div>
  );
} 