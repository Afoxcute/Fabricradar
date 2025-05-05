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
    <div className="card-body">
      {!isSignUp && (
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {initialValues ? "Update Profile" : "Complete Your Profile"}
        </h2>
      )}
      
      {!showOtp ? (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("firstName")}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your first name"
              />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("lastName")}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          {/* Account Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Account Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="USER"
                  {...form.register("accountType")}
                  checked={form.watch("accountType") === "USER"}
                  className="text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                />
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-300">Customer</span>
                </div>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="TAILOR"
                  {...form.register("accountType")}
                  checked={form.watch("accountType") === "TAILOR"}
                  className="text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                />
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-cyan-400" />
                  <span className="text-gray-300">Tailor</span>
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Select &quot;Customer&quot; if you want to order clothes, or &quot;Tailor&quot; if you want to offer tailoring services</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email {!form.watch("phone") && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              {...form.register("email")}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your email address"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number {!form.watch("email") && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              {...form.register("phone")}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your phone number"
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">At least one contact method (email or phone) is required</p>
          </div>
          
          {walletAddress && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                disabled
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 opacity-70"
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center py-3" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>{isSignUp ? "Creating Account..." : "Updating Profile..."}</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? "Create Account" : "Save Profile"}</span>
                <ChevronsRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          {isSignUp && (
            <div className="text-center text-sm mt-4">
              <span className="text-gray-400">Already have an account?</span>{" "}
              <button 
                type="button"
                className="text-cyan-400 hover:underline" 
                onClick={() => router.push("/auth/signin")}
              >
                Sign in
              </button>
            </div>
          )}
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
                <span>Verify OTP</span>
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
  );
} 