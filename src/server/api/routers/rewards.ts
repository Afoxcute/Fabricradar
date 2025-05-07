import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define RewardType as a type to match the client-side type
type RewardType = 'DISCOUNT' | 'FREE_ITEM' | 'POINTS' | 'PRIORITY';

// Create a zod enum schema for validation
const RewardTypeSchema = z.enum(['DISCOUNT', 'FREE_ITEM', 'POINTS', 'PRIORITY']);

export const rewardsRouter = createTRPCRouter({
  // Create a new reward
  createReward: protectedProcedure
    .input(z.object({
      name: z.string().min(3).max(100),
      description: z.string().min(10),
      type: z.enum(['DISCOUNT', 'FREE_ITEM', 'POINTS', 'PRIORITY']),
      value: z.number().positive(),
      minSpend: z.number().positive().optional().nullable(),
      startDate: z.date(),
      endDate: z.date(),
      isActive: z.boolean().default(true),
      imageUrl: z.string().url().optional().nullable(),
      maxRedemptions: z.number().int().positive().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Only tailors can create rewards
      if (ctx.user.accountType !== "TAILOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only tailors can create rewards",
        });
      }
      
      try {
        const reward = await ctx.db.reward.create({
          data: {
            ...input,
            tailorId: ctx.user.id,
            redemptionCount: 0,
          },
        });
        
        return {
          success: true,
          reward,
        };
      } catch (error) {
        console.error('Error creating reward:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create reward",
        });
      }
    }),

  // Get rewards for a tailor
  getTailorRewards: publicProcedure
    .input(z.object({
      tailorId: z.number(),
      includeExpired: z.boolean().default(false),
      includeInactive: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      // Construct the where condition based on inputs
      const whereCondition: any = {
        tailorId: input.tailorId,
      };

      // Only include active rewards unless specified
      if (!input.includeInactive) {
        whereCondition.isActive = true;
      }

      // Exclude expired rewards unless specified
      if (!input.includeExpired) {
        whereCondition.endDate = {
          gte: new Date(),
        };
      }
      
      try {
        const rewards = await ctx.db.reward.findMany({
          where: whereCondition,
          orderBy: { createdAt: "desc" },
        });

        return { 
          success: true,
          rewards 
        };
      } catch (error) {
        console.error('Error fetching tailor rewards:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tailor rewards",
        });
      }
    }),

  // Get a single reward by ID
  getRewardById: publicProcedure
    .input(z.object({
      rewardId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const reward = await ctx.db.reward.findUnique({
          where: { id: input.rewardId },
          include: {
            tailor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                accountType: true,
              },
            },
          },
        });

        if (!reward) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Reward not found",
          });
        }

        return {
          success: true,
          reward,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error fetching reward:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reward",
        });
      }
    }),

  // Update a reward
  updateReward: protectedProcedure
    .input(z.object({
      rewardId: z.number(),
      name: z.string().min(3).max(100).optional(),
      description: z.string().min(10).optional(),
      type: z.enum(['DISCOUNT', 'FREE_ITEM', 'POINTS', 'PRIORITY']).optional(),
      value: z.number().positive().optional(),
      minSpend: z.number().positive().optional().nullable(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      isActive: z.boolean().optional(),
      imageUrl: z.string().url().optional().nullable(),
      maxRedemptions: z.number().positive().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { rewardId, ...data } = input;
      
      // Find the reward first to verify ownership
      const existingReward = await ctx.db.reward.findUnique({
        where: { id: rewardId },
      });
      
      if (!existingReward) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reward not found",
        });
      }
      
      // Only the reward creator (tailor) can update it
      if (existingReward.tailorId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this reward",
        });
      }
      
      try {
        const updatedReward = await ctx.db.reward.update({
          where: { id: rewardId },
          data,
        });
        
        return {
          success: true,
          reward: updatedReward,
        };
      } catch (error) {
        console.error('Error updating reward:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update reward",
        });
      }
    }),

  // Delete a reward
  deleteReward: protectedProcedure
    .input(z.object({
      rewardId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find the reward first to verify ownership
      const existingReward = await ctx.db.reward.findUnique({
        where: { id: input.rewardId },
      });
      
      if (!existingReward) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reward not found",
        });
      }
      
      // Only the reward creator (tailor) can delete it
      if (existingReward.tailorId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this reward",
        });
      }
      
      try {
        await ctx.db.reward.delete({
          where: { id: input.rewardId },
        });
        
        return {
          success: true,
          message: "Reward deleted successfully",
        };
      } catch (error) {
        console.error('Error deleting reward:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete reward",
        });
      }
    }),
}); 