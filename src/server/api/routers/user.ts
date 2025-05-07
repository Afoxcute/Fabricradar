import { createTRPCRouter, publicProcedure } from "../../../server/api/trpc";
import { z } from "zod";
import { AuthService } from "../../../services/AuthService";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

// AccountType string literal type matching the Prisma schema enum
type AccountTypeValue = "USER" | "TAILOR";

// Add AccountType enum for validation
const AccountTypeEnum = z.enum(["USER", "TAILOR"]);

// Define our own user input interface to avoid Prisma type issues
interface UserCreateData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  walletAddress?: string | null;
  accountType?: AccountTypeValue;
}

export const userRouter = createTRPCRouter({
  addToWaitlist: publicProcedure
    .input(z.object({ contact: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let isEmail = false;
      if (input.contact.includes("@")) {
        isEmail = true;
      }
      const user = await ctx.db.waitlist.create({
        data: {
          contact: input.contact,
          name: input.name,
          isEmail,
        },
      });
      return user;
    }),
  registerUser: publicProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        walletAddress: z.string().optional(),
        accountType: AccountTypeEnum.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure at least one contact method is provided
        if (!input.email && !input.phone) {
          throw new TRPCError({
            code: "BAD_REQUEST",
          message: "Either email or phone is required",
        });
      }

      const authService = new AuthService(ctx.db);
      
      // Check if user exists with email
      let user = null;
      if (input.email) {
        user = await authService.findUserByEmail(input.email);
      }
      
      // If not found by email, try phone
      if (!user && input.phone) {
        user = await authService.findUserByPhone(input.phone);
      }

      // If user already exists, return error
      if (user) {
            throw new TRPCError({
              code: "CONFLICT",
          message: "User with this email or phone already exists",
        });
      }

      // Create user data object with our custom interface
      const userData: UserCreateData = {
        email: input.email,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
      };
      
      // Create database record
      try {
        // Add accountType if provided
        if (input.accountType) {
          userData.accountType = input.accountType;
        }

        // Add wallet address if provided
        if (input.walletAddress) {
          userData.walletAddress = input.walletAddress;
        }
        
        // Create new user
        user = await ctx.db.user.create({
          data: userData as any,
        });
      } catch (error) {
        console.error("Error creating user with advanced fields:", error);
        
        // Fallback: Try with basic fields only
        const fallbackData = {
          email: input.email,
          phone: input.phone,
          firstName: input.firstName,
          lastName: input.lastName,
        };
        
        user = await ctx.db.user.create({
          data: fallbackData,
        });
      }

      return user;
    }),
    
  updateUser: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        walletAddress: z.string().optional(),
        accountType: AccountTypeEnum.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...inputData } = input;
      
      // Create update data object
      // Using any type to bypass TypeScript strict checks until Prisma types are fully updated
      const updateData: any = {
        email: inputData.email,
        phone: inputData.phone,
        firstName: inputData.firstName,
        lastName: inputData.lastName,
      };
      
      // Add accountType if provided
      if (inputData.accountType) {
        updateData.accountType = inputData.accountType;
      }
      
      // Handle wallet address
      if (inputData.walletAddress) {
        updateData.walletAddress = inputData.walletAddress;
      }
      
      // Update user
      const user = await ctx.db.user.update({
        where: { id: userId },
        data: updateData,
      });

      return user;
    }),
    
  requestOtp: publicProcedure
    .input(z.object({ identifier: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authService = new AuthService(ctx.db);
      
      // Find user by email or phone
      let user = null;
      if (input.identifier.includes("@")) {
        user = await authService.findUserByEmail(input.identifier);
      } else {
        user = await authService.findUserByPhone(input.identifier);
      }
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if we're in development mode with SMS disabled
      const isDev = process.env.NODE_ENV === "development";
      const isSmsDisabled = process.env.ENABLE_SMS === "false";
      
      // Generate OTP code (6 digits)
      const otpCode = isDev || isSmsDisabled 
        ? "000000" 
        : Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database
      await authService.createOtp(user.id, otpCode);
      
      // In development, return the OTP code for testing
      const devResponse = isDev 
        ? { otp: otpCode }
        : {};
      
      // If we're in development with SMS disabled, return early with success
      if (isDev && isSmsDisabled) {
        console.log(`Development mode with SMS disabled - Using default OTP: 000000 for ${input.identifier}`);
        return {
          success: true,
          userId: user.id,
          otp: "000000",
        };
      }
      
      // In production, this would send an email or SMS with the OTP
      // For now, we'll just return success
      return {
        success: true,
        userId: user.id,
        ...devResponse,
      };
    }),
    
  login: publicProcedure
    .input(z.object({ identifier: z.string(), otp: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authService = new AuthService(ctx.db);
      
      // Find user by email or phone
      let user = null;
      if (input.identifier.includes("@")) {
        user = await authService.findUserByEmail(input.identifier);
      } else {
        user = await authService.findUserByPhone(input.identifier);
      }
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Special case: if otp is "check-only", just return the user without verifying OTP
      // This is used for checking if a user exists with a given email/phone
      if (input.otp === "check-only") {
        console.log(`Check-only login for user ID ${user.id} with identifier ${input.identifier}`);
      return user;
      }

      // Verify OTP
      const isValid = await authService.verifyOtp(user.id, input.otp);
      
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid OTP",
        });
      }

      // Return user data
      return user;
    }),
    
  getUserById: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      return user;
    }),
    
  getUserByWallet: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        if (!input.walletAddress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wallet address is required",
          });
        }

        console.log(`Looking up user with wallet address: ${input.walletAddress}`);
        
        // @ts-ignore - walletAddress might not be recognized by TypeScript due to missing prisma migration
        const user = await ctx.db.user.findFirst({
          where: { 
            // @ts-ignore - This is a temporary workaround for TypeScript
            walletAddress: input.walletAddress 
          },
        });
        
        if (!user) {
          console.log(`No user found with wallet address: ${input.walletAddress}`);
        } else {
          console.log(`Found user ID ${user.id} with wallet address: ${input.walletAddress}`);
        }
        
        return user; // May be null if no user found with this wallet
      } catch (error) {
        console.error("Error finding user by wallet address:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to lookup user by wallet address",
          cause: error,
        });
      }
    }),
});
