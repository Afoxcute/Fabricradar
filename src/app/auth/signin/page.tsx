"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../../trpc/react";
import { ClientTRPCErrorHandler, parsePhoneNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronsRight, Key, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import BackgroundEffect from "@/components/background-effect/background-effect";
import { useAuth } from "../../../providers/auth-provider";

const signinSchema = z.object({
  identifier: z.string().min(3, "Email or phone is required"),
});

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const requestOtp = api.users.requestOtp.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const handleSubmit = async (values: z.infer<typeof signinSchema>) => {
    setIsLoading(true);
    try {
      // Format and validate the identifier
      let formattedIdentifier = values.identifier.trim();
      if (!formattedIdentifier) {
        toast.error("Please enter an email or phone number");
        return;
      }
      
      // If it looks like a phone number, format it
      if (/^\d/.test(formattedIdentifier) || formattedIdentifier.startsWith('+')) {
        formattedIdentifier = parsePhoneNumber(formattedIdentifier);
      }
      
      if (!formattedIdentifier) {
        toast.error("Invalid contact information");
        return;
      }
      
      // Store the formatted identifier
      setIdentifier(formattedIdentifier);
      
      // Check if we're in development mode with SMS disabled
      const isDev = process.env.NODE_ENV === 'development';
      const isSmsDisabled = process.env.ENABLE_SMS === 'false';
      
      if (isDev && isSmsDisabled) {
        // Use default OTP code in development with SMS disabled
        const defaultOtp = '000000';
        toast.success(`Development mode with SMS disabled: Using default OTP: ${defaultOtp}`);
        setOtpCode(defaultOtp);
        setShowOtp(true);
      } else {
        // Request OTP
        const response = await requestOtp.mutateAsync({
          identifier: formattedIdentifier,
        });

        // In development, show the OTP in a toast
        if (isDev && response.otp) {
          toast.success(`Development OTP: ${response.otp}`);
          setOtpCode(response.otp);
        }

        toast.success(`Verification code sent to your ${formattedIdentifier.includes('@') ? 'email' : 'phone'}`);
        setShowOtp(true);
      }
    } catch (error) {
      console.error("Login request error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send verification code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Check for development mode with SMS disabled
    const isDev = process.env.NODE_ENV === 'development';
    const isSmsDisabled = process.env.ENABLE_SMS === 'false';
    
    // Use default OTP code in development mode or SMS disabled if not provided
    let codeToVerify = otpCode;
    if ((isDev && isSmsDisabled) || (isDev && (!codeToVerify || codeToVerify.length < 6))) {
      codeToVerify = '000000';
      toast.success("Using default development OTP: 000000");
    } else if (!otpCode || otpCode.length < 6) {
      toast.error("Please enter a valid OTP code");
      return;
    }

    if (!identifier) {
      toast.error("Invalid session. Please try again");
      setShowOtp(false);
      return;
    }

    setIsLoading(true);
    try {
      // Call the login function from auth provider
      await login(identifier, codeToVerify);
      toast.success("Login successful!");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to verify OTP. Please check the code and try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden flex items-center justify-center">
      <BackgroundEffect />
      
      <div className="card bg-gray-900/30 backdrop-blur-sm shadow-xl max-w-md w-full p-6 rounded-xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
          
          {!showOtp ? (
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email or Phone <span className="text-red-500">*</span>
                </label>
                <input
                  {...form.register("identifier")}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your email or phone number"
                />
                {form.formState.errors.identifier && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.identifier.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">We&apos;ll send a verification code to this contact</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center py-3" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronsRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm mt-4">
                <span className="text-gray-400">Don&apos;t have an account?</span>{" "}
                <button 
                  type="button"
                  className="text-cyan-400 hover:underline" 
                  onClick={() => router.push("/auth/signup")}
                >
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Enter OTP Code
                </label>
                <input 
                  type="text"
                  placeholder="Enter 6-digit code" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-sm text-gray-400 mt-2">
                  We sent a verification code to your {identifier.includes('@') ? 'email' : 'phone'}
                </p>
              </div>
              
              <Button 
                onClick={handleVerifyOtp} 
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center py-3" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <Key className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm">
                <button 
                  type="button"
                  className="text-cyan-400 hover:underline" 
                  onClick={() => setShowOtp(false)}
                >
                  Go back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 