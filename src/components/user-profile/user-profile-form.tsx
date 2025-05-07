"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../trpc/react";
import { ClientTRPCErrorHandler, parsePhoneNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronsRight, Key, Loader2, UserCircle, Scissors } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { debugProfileStatus } from "@/utils/user-profile-utils";

// Form validation schema
const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  walletAddress: z.string().optional(),
  accountType: z.enum(["USER", "TAILOR"]).default("USER"),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"],
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  initialValues?: Partial<UserProfileFormValues>;
  onSuccess?: (userData: any) => void;
  isSignUp?: boolean;
  walletAddress?: string;
}

export function UserProfileForm({
  initialValues,
  onSuccess,
  isSignUp = false,
  walletAddress,
}: UserProfileFormProps) {
  const router = useRouter();
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [identifier, setIdentifier] = useState("");
  
  // Initialize form with provided values or defaults
  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      // Always prioritize the connected wallet address over any stored value
      walletAddress: walletAddress || initialValues?.walletAddress || "",
      accountType: initialValues?.accountType || "USER",
    },
  });

  // TRPC mutations
  const registerUser = api.users.registerUser.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const updateUser = api.users.updateUser.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const requestOtp = api.users.requestOtp.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const loginMutation = api.users.login.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const handleSubmit = async (values: UserProfileFormValues) => {
    setIsLoading(true);
    try {
      // Ensure we have either email or phone
      if (!values.email && !values.phone) {
        toast.error("Email or phone is required");
        return;
      }
      
      // Format phone number if provided
      const formattedValues = {
        ...values,
        phone: values.phone ? parsePhoneNumber(values.phone) : undefined,
        email: values.email || undefined, // Make sure email is undefined if empty string
        walletAddress: walletAddress || values.walletAddress,
      };
      
      let userData;
      
      // If we have a wallet address, first check if this user already exists with provided email/phone
      if (walletAddress && (formattedValues.email || formattedValues.phone)) {
        try {
          // Try to find a user with this email or phone
          const identifier = formattedValues.email || formattedValues.phone;
          console.log(`Checking if user exists with identifier: ${identifier}`);
          
          const loginResponse = await loginMutation.mutateAsync({
            identifier: identifier as string,
            otp: "check-only" // Special value that will just check if the user exists
          }).catch(error => {
            // If the error is "User not found", that's actually good for us in this case
            if (error.message && error.message.includes("User not found")) {
              console.log("No existing user found with this identifier, proceeding with creation");
              return null;
            }
            throw error; // Otherwise rethrow the error
          });
          
          if (loginResponse) {
            console.log("Found existing user with this identifier", loginResponse);
            // User exists, set identifier for OTP verification
            setIdentifier(identifier!);
            setUserId(loginResponse.id);
            
            // If the user already has a different wallet address, we'll associate this new one after verification
            if (loginResponse.walletAddress && loginResponse.walletAddress !== walletAddress) {
              console.log("User has a different wallet address, will associate this new one after verification");
            }
            
            // Show OTP verification to confirm identity
            toast.success("Account found! Please verify with OTP code to continue");
            await requestOtp.mutateAsync({ identifier: identifier! });
            
            // In development, show the OTP in a toast
            if (process.env.NODE_ENV === 'development') {
              toast.success(`Development OTP: 000000`);
              // Pre-fill the OTP field in development mode
              setOtpCode('000000');
            }
            
            setShowOtp(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error checking existing user:", error);
          // Continue with normal flow if there was an error checking
        }
      }
      
      if (isSignUp) {
        // Create a new user
        userData = await registerUser.mutateAsync(formattedValues)
          .catch(error => {
            // If error indicates user already exists, switch to verification flow
            if (error.message && (
                error.message.includes("already exists") || 
                error.message.includes("duplicate key")
            )) {
              console.log("User already exists, switching to verification flow");
              const identifier = formattedValues.email || formattedValues.phone;
              if (identifier) {
                setIdentifier(identifier);
                requestOtp.mutateAsync({ identifier })
                  .then(() => {
                    if (process.env.NODE_ENV === 'development') {
                      toast.success(`Development OTP: 000000`);
                      setOtpCode('000000');
                    }
                    setShowOtp(true);
                    toast.success("This email/phone is already registered. Please verify to continue.");
                  })
                  .catch(e => {
                    console.error("Failed to request OTP:", e);
                    toast.error("Failed to send verification code");
                  });
              }
              throw new Error("Please verify your existing account");
            }
            throw error;
          });
      } else if (user?.id) {
        try {
          // Attempt to update existing user
          userData = await updateUser.mutateAsync({
            userId: user.id,
            ...formattedValues,
          });
          
          // If update was successful and no verification needed
          if (userData && !showOtp && onSuccess) {
            onSuccess(userData);
            toast.success("Profile updated successfully!");
            return;
          }
        } catch (updateError) {
          // If updating user fails with "User not found", try registering as a new user
          if (updateError instanceof Error && updateError.message.includes("User not found")) {
            console.warn("User not found when updating. Attempting to register as a new user.");
            try {
              userData = await registerUser.mutateAsync(formattedValues)
                .catch(registerError => {
                  // If error indicates user already exists, switch to verification flow
                  if (registerError.message && (
                      registerError.message.includes("already exists") || 
                      registerError.message.includes("duplicate key")
                  )) {
                    console.log("User already exists, switching to verification flow");
                    const identifier = formattedValues.email || formattedValues.phone;
                    if (identifier) {
                      setIdentifier(identifier);
                      requestOtp.mutateAsync({ identifier })
                        .then(() => {
                          if (process.env.NODE_ENV === 'development') {
                            toast.success(`Development OTP: 000000`);
                            setOtpCode('000000');
                          }
                          setShowOtp(true);
                          toast.success("This email/phone is already registered. Please verify to continue.");
                        })
                        .catch(e => {
                          console.error("Failed to request OTP:", e);
                          toast.error("Failed to send verification code");
                        });
                    }
                    throw new Error("Please verify your existing account");
                  }
                  throw registerError;
                });
              toast.success("Created a new user profile");
            } catch (registerError) {
              if ((registerError as Error).message === "Please verify your existing account") {
                // This is handled already by the error handler in registerUser
                return;
              }
              console.error("Failed to register as new user:", registerError);
              throw updateError; // Re-throw the original error if registration fails
            }
          } else {
            // If it's a different error, rethrow it
            throw updateError;
          }
        }
      } else {
        // In development mode, provide a workaround for missing user
        if (process.env.NODE_ENV === 'development') {
          console.warn("Development mode: Creating a mock user since no user ID was found");
          
          // Try to register as a new user with the provided info
          try {
            userData = await registerUser.mutateAsync(formattedValues)
              .catch(registerError => {
                // If error indicates user already exists, switch to verification flow
                if (registerError.message && (
                    registerError.message.includes("already exists") || 
                    registerError.message.includes("duplicate key")
                )) {
                  console.log("User already exists, switching to verification flow");
                  const identifier = formattedValues.email || formattedValues.phone;
                  if (identifier) {
                    setIdentifier(identifier);
                    requestOtp.mutateAsync({ identifier })
                      .then(() => {
                        if (process.env.NODE_ENV === 'development') {
                          toast.success(`Development OTP: 000000`);
                          setOtpCode('000000');
                        }
                        setShowOtp(true);
                        toast.success("This email/phone is already registered. Please verify to continue.");
                      })
                      .catch(e => {
                        console.error("Failed to request OTP:", e);
                        toast.error("Failed to send verification code");
                      });
                  }
                  return null; // Return null to indicate we've handled this case
                }
                throw registerError;
              });
            
            if (userData === null) {
              // This means we've already handled the "user exists" case
              return;
            }
            
            toast.success("Development mode: Created a new user");
          } catch (registerError) {
            console.error("Failed to register mock user:", registerError);
            // Create a mock user data with the form values and a temporary ID
            userData = { id: 9999, ...formattedValues };
          }
        } else {
          // Try to create a new user if there's no user ID
          try {
            console.warn("No user ID found. Attempting to register as a new user.");
            userData = await registerUser.mutateAsync(formattedValues)
              .catch(registerError => {
                // If error indicates user already exists, switch to verification flow
                if (registerError.message && (
                    registerError.message.includes("already exists") || 
                    registerError.message.includes("duplicate key")
                )) {
                  console.log("User already exists, switching to verification flow");
                  const identifier = formattedValues.email || formattedValues.phone;
                  if (identifier) {
                    setIdentifier(identifier);
                    requestOtp.mutateAsync({ identifier })
                      .then(() => {
                        if (process.env.NODE_ENV === 'development') {
                          toast.success(`Development OTP: 000000`);
                          setOtpCode('000000');
                        }
                        setShowOtp(true);
                        toast.success("This email/phone is already registered. Please verify to continue.");
                      })
                      .catch(e => {
                        console.error("Failed to request OTP:", e);
                        toast.error("Failed to send verification code");
                      });
                  }
                  return null; // Return null to indicate we've handled this case
                }
                throw registerError;
              });
              
            if (userData === null) {
              // This means we've already handled the "user exists" case
              return;
            }
              
            toast.success("Created a new user profile");
          } catch (registerError) {
            console.error("Failed to register as new user:", registerError);
            throw new Error("Could not update or create user profile");
          }
        }
      }

      if (!userData || !userData.id) {
        throw new Error(isSignUp ? "Failed to create user account" : "Failed to update profile");
      }

      // Store user ID and identifier for OTP verification if needed
      setUserId(userData.id);
      const userIdentifier = values.email || values.phone;
      if (!userIdentifier) {
        throw new Error("Email or phone is required");
      }
      
      // Format and store the identifier
      const formattedIdentifier = values.phone 
        ? parsePhoneNumber(values.phone)
        : values.email;
      
      if (!formattedIdentifier) {
        throw new Error("Invalid contact information");
      }
      
      setIdentifier(formattedIdentifier);

      // Check if we're in development mode with SMS disabled
      const isDev = process.env.NODE_ENV === 'development';
      const isSmsDisabled = process.env.ENABLE_SMS === 'false';
      
      if (isDev && isSmsDisabled) {
        // Use default OTP code
        const defaultOtp = '000000';
        toast.success(`Development mode with SMS disabled: Using default OTP: ${defaultOtp}`);
        setOtpCode(defaultOtp);
        setShowOtp(true);
      } else {
        // Request OTP for verification
        const response = await requestOtp.mutateAsync({
          identifier: formattedIdentifier,
        });

        // In development, show the OTP in a toast
        if (process.env.NODE_ENV === 'development') {
          // Use the OTP from the response if available, otherwise use default '000000'
          const devOtp = response.otp || '000000';
          toast.success(`Development OTP: ${devOtp}`);
          
          // Pre-fill the OTP field in development mode
          setOtpCode(devOtp);
        }
      }

      toast.success(isSignUp ? "Account created! Please verify with OTP code" : "Profile updated! Please verify with OTP code");
      setShowOtp(true);
    } catch (error) {
      console.error(isSignUp ? "Registration error:" : "Profile update error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(isSignUp ? "Failed to create account" : "Failed to update profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Check for development mode with SMS disabled first
    const isDev = process.env.NODE_ENV === 'development';
    const isSmsDisabled = process.env.ENABLE_SMS === 'false';
    
    // In development with SMS disabled or if OTP is not provided, use the default OTP
    let codeToVerify = otpCode;
    if ((isDev && isSmsDisabled) || (isDev && (!codeToVerify || codeToVerify.length < 6))) {
      codeToVerify = '000000';
      toast.success("Using default development OTP: 000000");
    } else if (!otpCode || otpCode.length < 6) {
      toast.error("Please enter a valid OTP code");
      return;
    }

    setIsLoading(true);
    try {
      // Use the login procedure to verify the OTP
      const userData = await loginMutation.mutateAsync({
        identifier,
        otp: codeToVerify,
      });

      if (isSignUp) {
        toast.success("Account verified successfully!");
        router.push("/auth/signin");
      } else {
        // Ensure we save the verified user data to localStorage
        localStorage.setItem("auth_user", JSON.stringify(userData));
        console.log("Profile verification complete. User data:", debugProfileStatus(userData));
        
        // Make sure the wallet address is associated with this user
        if (walletAddress && (!(userData as any).walletAddress || (userData as any).walletAddress !== walletAddress)) {
          try {
            await updateUser.mutateAsync({
              userId: userData.id,
              walletAddress,
            });
          } catch (walletError) {
            console.error("Failed to associate wallet with verified account:", walletError);
          }
        }
        
        toast.success("Profile updated and verified successfully!");
        if (onSuccess) {
          onSuccess(userData);
        }
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-50 rounded-lg backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-500 mx-auto" />
            <p className="mt-2 text-white">Processing your request...</p>
          </div>
        </div>
      )}

      {showOtp ? (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mb-4">
              <Key className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verify Your Identity</h3>
            <p className="text-gray-400 text-sm mb-1">
              We sent a verification code to
            </p>
            <p className="font-mono text-cyan-400">
              {identifier.includes('@') 
                ? identifier 
                : identifier.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
            </p>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                className="block w-full px-4 py-3 text-center text-2xl tracking-widest bg-gray-800 border border-gray-700 focus:border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                pattern="\d{6}"
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleVerifyOtp}
              className="w-full py-6 bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2" 
              disabled={otpCode.length < 6 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Verify Code</span>
                  <ChevronsRight className="h-5 w-5" />
                </>
              )}
            </Button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => setShowOtp(false)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Go back to profile form
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 animate-in fade-in duration-300">
          {/* Account Type Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {form.watch('accountType') === 'TAILOR' ? (
                  <Scissors className="h-5 w-5 text-cyan-400 mr-2" />
                ) : (
                  <UserCircle className="h-5 w-5 text-blue-400 mr-2" />
                )}
                <h3 className="text-lg font-semibold">Account Type</h3>
              </div>
              {user && user.accountType && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.accountType === 'TAILOR' 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {user.accountType}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                  form.watch('accountType') === 'USER'
                    ? 'bg-blue-900/20 border-blue-700'
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  value="USER"
                  {...form.register('accountType')}
                  className="sr-only"
                />
                <UserCircle className={`h-10 w-10 mb-2 ${
                  form.watch('accountType') === 'USER'
                    ? 'text-blue-400'
                    : 'text-gray-400'
                }`} />
                <span className={form.watch('accountType') === 'USER' ? 'font-medium' : 'text-gray-400'}>
                  Customer
                </span>
              </label>
              
              <label 
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                  form.watch('accountType') === 'TAILOR'
                    ? 'bg-cyan-900/20 border-cyan-700'
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  value="TAILOR"
                  {...form.register('accountType')}
                  className="sr-only"
                />
                <Scissors className={`h-10 w-10 mb-2 ${
                  form.watch('accountType') === 'TAILOR'
                    ? 'text-cyan-400'
                    : 'text-gray-400'
                }`} />
                <span className={form.watch('accountType') === 'TAILOR' ? 'font-medium' : 'text-gray-400'}>
                  Tailor
                </span>
              </label>
            </div>
          </div>
          
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${
                    form.formState.errors.firstName
                      ? 'border-red-500'
                      : 'border-gray-700 focus:border-cyan-500'
                  }`}
                  placeholder="Your first name"
                  {...form.register('firstName')}
                />
                {form.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${
                    form.formState.errors.lastName
                      ? 'border-red-500'
                      : 'border-gray-700 focus:border-cyan-500'
                  }`}
                  placeholder="Your last name"
                  {...form.register('lastName')}
                />
                {form.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Contact Information</h3>
            <p className="text-sm text-gray-400 mb-2">
              At least one contact method is required. We&apos;ll use this to verify your account.
            </p>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${
                  form.formState.errors.email
                    ? 'border-red-500'
                    : 'border-gray-700 focus:border-cyan-500'
                }`}
                placeholder="email@example.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors ${
                  form.formState.errors.phone
                    ? 'border-red-500'
                    : 'border-gray-700 focus:border-cyan-500'
                }`}
                placeholder="(123) 456-7890"
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>
          
          {/* Wallet Address */}
          {walletAddress && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Connected Wallet</h3>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-md">
                <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                <p className="font-mono text-xs break-all">{walletAddress}</p>
              </div>
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Save Changes'}</span>
                <ChevronsRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
} 