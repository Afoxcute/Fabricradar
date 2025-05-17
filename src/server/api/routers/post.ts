import { z } from "zod";
import { Twilio } from "twilio";

import { createTRPCRouter, publicProcedure } from "../../api/trpc";
import { env } from "../../../env";
import { AuthService } from "../../../../src/services/AuthService";

async function sendSms(to: string, text: string) {
  // Read Twilio credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN; 
  
  // Check if we're in development mode or if SMS is disabled
  const isDev = process.env.NODE_ENV === 'development';
  const isSmsEnabled = String(env.ENABLE_SMS) === "true";
  
  // If credentials are missing but we're in dev mode, just mock the SMS sending
  if ((!accountSid || !authToken) && isDev) {
    console.log('MOCK SMS SENDING (Development mode):', { to, text });
    return { success: true, messageId: 'mock-message-id', mock: true };
  }
  
  // If SMS is not enabled, just return success without sending
  if (!isSmsEnabled) {
    console.log('SMS DISABLED:', { to, text });
    return { success: true, messageId: 'disabled', disabled: true };
  }
  
  // If credentials are missing in production, log error
  if (!accountSid || !authToken) {
    console.error("Twilio credentials are not configured");
    throw new Error("Twilio credentials are not configured");
  }
  
  // Proceed with real SMS sending
  const client = new Twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER || "+12135148760", // Fallback to hardcoded number if env not set
      body: text,
    });
    console.log("Message sent:", message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export const postRouter = createTRPCRouter({
  // Original OTP procedures - keeping for backward compatibility
  original_otp: publicProcedure
    .input(z.object({ phone: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate OTP code - use a fixed code in development for easier testing
        const isDev = process.env.NODE_ENV === 'development';
        const otp = isDev ? "000000" : Math.floor(100000 + Math.random() * 900000).toString();
        
        // Find or create user
        let user = await ctx.db.user.findUnique({
          where: {
            phone: input.phone,
          },
        });
        
        if (!user) {
          user = await ctx.db.user.create({
            data: {
              phone: input.phone,
            },
          });
        }
        
        // Try to send SMS, but handle errors gracefully
        try {
          await sendSms(input.phone, `Your Druidapp OTP is: ${otp}`);
        } catch (error) {
          console.error("Failed to send SMS:", error);
          // In development, continue even if SMS fails
          if (process.env.NODE_ENV !== 'development') {
            if (error instanceof Error && error.message.includes("not configured")) {
              throw new Error("SMS service is not properly configured. Please contact support.");
            } else {
              throw new Error("Failed to send verification code. Please try again.");
            }
          } else {
            console.log("Development mode: Continuing despite SMS failure");
          }
        }
        
        // Create the AuthService instance
        const authService = new AuthService(ctx.db);
        
        // Store the OTP in database
        await authService.createOtp(user.id, otp);
        
        // In development, return the OTP for easier testing
        return isDev ? otp : "OTP sent successfully";
      } catch (error) {
        console.error("OTP generation error:", error);
        throw error;
      }
    }),
  original_verifyOtp: publicProcedure
    .input(z.object({ phone: z.string(), otp: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get user by phone
        const user = await ctx.db.user.findUnique({
          where: {
            phone: input.phone,
          },
        });
        
        if (!user) {
          throw new Error("User not found. Please request a new verification code.");
        }
        
        // Create the AuthService instance
        const authService = new AuthService(ctx.db);
        
        // Verify OTP
        const isValid = await authService.verifyOtp(user.id, input.otp);
        
        if (!isValid) {
          throw new Error("Invalid or expired verification code");
        }
        
        return user;
      } catch (error) {
        console.error("OTP verification error:", error);
        throw error;
      }
    }),
  // New OTP procedures - aligned with the user router's procedures
  createOtp: publicProcedure
    .input(z.object({ 
      identifier: z.string(), 
      type: z.enum(["email", "phone"]) 
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate OTP code - use a fixed code in development for easier testing
        const isDev = process.env.NODE_ENV === 'development';
        const otp = isDev ? "000000" : Math.floor(100000 + Math.random() * 900000).toString();
        
        // Find or create user based on identifier type
        let user;
        if (input.type === "email") {
          user = await ctx.db.user.findUnique({
            where: { email: input.identifier },
          });
          
          if (!user) {
            throw new Error("User not found. Please sign up first.");
          }
          
          // In a real app, you would send an email with the OTP here
          console.log(`EMAIL OTP for ${input.identifier}: ${otp}`);
        } else {
          user = await ctx.db.user.findUnique({
            where: { phone: input.identifier },
          });
          
          if (!user) {
            throw new Error("User not found. Please sign up first.");
          }
          
          // Send SMS with OTP
          try {
            await sendSms(input.identifier, `Your Druidapp OTP is: ${otp}`);
          } catch (error) {
            console.error("Failed to send SMS:", error);
            // In development, continue even if SMS fails
            if (process.env.NODE_ENV !== 'development') {
              throw new Error("Failed to send verification code. Please try again.");
            } else {
              console.log("Development mode: Continuing despite SMS failure");
            }
          }
        }
        
        // Create the AuthService instance
        const authService = new AuthService(ctx.db);
        
        // Store the OTP in database
        await authService.createOtp(user.id, otp);
        
        // In development, return the OTP for easier testing
        return isDev ? { success: true, otp } : { success: true };
      } catch (error) {
        console.error("OTP generation error:", error);
        throw error;
      }
    }),
  verifyOtp: publicProcedure
    .input(z.object({ 
      identifier: z.string(), 
      otpCode: z.string() 
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Determine if the identifier is an email or phone
        const isEmail = input.identifier.includes('@');
        
        // Find user based on identifier type
        const user = await ctx.db.user.findUnique({
          where: isEmail ? { email: input.identifier } : { phone: input.identifier },
        });
        
        if (!user) {
          throw new Error("User not found. Please try again.");
        }
        
        // Create the AuthService instance
        const authService = new AuthService(ctx.db);
        
        // Verify OTP
        const isOtpValid = await authService.verifyOtp(user.id, input.otpCode);
        
        if (!isOtpValid) {
          return { success: false, message: "Invalid or expired verification code" };
        }
        
        return { success: true, user };
      } catch (error) {
        console.error("OTP verification error:", error);
        throw error;
      }
    }),
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Create a placeholder implementation that returns something
      return { success: true, message: `Created ${input.name}` };
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    return null;
  }),
});