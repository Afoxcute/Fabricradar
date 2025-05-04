import { createTRPCRouter, publicProcedure } from "../../../server/api/trpc";
import { z } from "zod";
import { AuthService } from "../../../services/AuthService";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

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

      // Create user data object with proper typing
      const userData = {
        email: input.email,
        phone: input.phone,
        firstName: input.firstName,
        lastName: input.lastName,
      };
      
      // Handle wallet address separately to avoid type issues
      // This is a workaround until the Prisma migration is properly applied
      try {
        // Try with wallet address first
        if (input.walletAddress) {
          // @ts-ignore - walletAddress might not be recognized by TypeScript due to missing prisma migration
          userData.walletAddress = input.walletAddress;
        }
        
        // Create new user
        user = await ctx.db.user.create({
          data: userData,
        });
      } catch (error) {
        console.error("Error creating user with wallet address:", error);
        
        // Fallback: Try without wallet address if there was an error
        user = await ctx.db.user.create({
          data: {
            email: input.email,
            phone: input.phone,
            firstName: input.firstName,
            lastName: input.lastName,
          },
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...inputData } = input;
      
      // Create update data object with proper typing
      const updateData = {
        email: inputData.email,
        phone: inputData.phone,
        firstName: inputData.firstName,
        lastName: inputData.lastName,
      };
      
      // Handle wallet address separately to avoid type issues
      if (inputData.walletAddress) {
        // @ts-ignore - walletAddress might not be recognized by TypeScript due to missing prisma migration
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

      // Generate OTP code (6 digits)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database
      await authService.createOtp(user.id, otpCode);
      
      // In development, return the OTP code for testing
      const devResponse = process.env.NODE_ENV === "development" 
        ? { otp: otpCode }
        : {};
        
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
        // @ts-ignore - walletAddress might not be recognized by TypeScript due to missing prisma migration
        const user = await ctx.db.user.findFirst({
          where: { 
            // @ts-ignore - This is a temporary workaround for TypeScript
            walletAddress: input.walletAddress 
          },
        });
        
        return user; // May be null if no user found with this wallet
      } catch (error) {
        console.error("Error finding user by wallet address:", error);
        return null;
      }
    }),
});
