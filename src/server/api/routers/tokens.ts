import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const tokenRouter = createTRPCRouter({
  // Create a new token entry
  createToken: protectedProcedure
    .input(z.object({
      mintAddress: z.string(),
      name: z.string(),
      symbol: z.string(),
      decimals: z.number().int().default(9),
      initialSupply: z.number(),
      txSignature: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is a tailor
      if (ctx.user.accountType !== "TAILOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only tailors can create tokens",
        });
      }
      
      try {
        // Check if the mint address already exists
        const existingToken = await ctx.db.tailorToken.findUnique({
          where: { mintAddress: input.mintAddress },
        });
        
        if (existingToken) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A token with this mint address already exists",
          });
        }
        
        // Create the token entry
        const token = await ctx.db.tailorToken.create({
          data: {
            ...input,
            tailorId: ctx.user.id,
          },
        });
        
        return {
          success: true,
          token,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error creating token entry:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create token entry",
        });
      }
    }),

  // Get tokens for a tailor
  getTailorTokens: publicProcedure
    .input(z.object({
      tailorId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const tokens = await ctx.db.tailorToken.findMany({
          where: { tailorId: input.tailorId },
          orderBy: { createdAt: "desc" },
        });

        return {
          success: true,
          tokens,
        };
      } catch (error) {
        console.error('Error fetching tailor tokens:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tailor tokens",
        });
      }
    }),
    
  // Get a single token by mint address
  getTokenByMintAddress: publicProcedure
    .input(z.object({
      mintAddress: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const token = await ctx.db.tailorToken.findUnique({
          where: { mintAddress: input.mintAddress },
          include: {
            tailor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        });

        if (!token) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Token not found",
          });
        }

        return {
          success: true,
          token,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error fetching token:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch token",
        });
      }
    }),
}); 