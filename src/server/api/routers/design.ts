import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const designRouter = createTRPCRouter({
  // Create a new design
  createDesign: protectedProcedure
    .input(z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10),
      price: z.number().positive(),
      imageUrl: z.string().url().optional().nullable(),
      averageTimeline: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is a tailor
      if (ctx.user.accountType !== "TAILOR") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only tailors can create designs",
        });
      }
      
      try {
        const design = await ctx.db.design.create({
          data: {
            ...input,
            tailorId: ctx.user.id,
          },
        });
        
        return {
          success: true,
          design,
        };
      } catch (error) {
        console.error('Error creating design:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create design",
        });
      }
    }),

  // Get designs for a tailor
  getTailorDesigns: publicProcedure
    .input(z.object({
      tailorId: z.number(),
      limit: z.number().min(1).max(50).default(12),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { tailorId, limit, cursor } = input;
      
      try {
        const designs = await ctx.db.design.findMany({
          where: { tailorId },
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: "desc" },
          include: {
            tailor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (designs.length > limit) {
          const nextItem = designs.pop();
          nextCursor = nextItem?.id;
        }

        return { designs, nextCursor };
      } catch (error) {
        console.error('Error fetching tailor designs:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tailor designs",
        });
      }
    }),

  // Get all designs (for homepage)
  getAllDesigns: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(12),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      
      try {
        const designs = await ctx.db.design.findMany({
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { createdAt: "desc" },
          include: {
            tailor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (designs.length > limit) {
          const nextItem = designs.pop();
          nextCursor = nextItem?.id;
        }

        return { designs, nextCursor };
      } catch (error) {
        console.error('Error fetching designs:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch designs",
        });
      }
    }),

  // Get a single design by ID
  getDesignById: publicProcedure
    .input(z.object({
      designId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const design = await ctx.db.design.findUnique({
          where: { id: input.designId },
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

        if (!design) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Design not found",
          });
        }

        return {
          success: true,
          design,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error fetching design:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch design",
        });
      }
    }),

  // Update a design
  updateDesign: protectedProcedure
    .input(z.object({
      designId: z.number(),
      title: z.string().min(3).max(100).optional(),
      description: z.string().min(10).optional(),
      price: z.number().positive().optional(),
      imageUrl: z.string().url().optional().nullable(),
      averageTimeline: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { designId, ...data } = input;
      
      // Find the design first to verify ownership
      const existingDesign = await ctx.db.design.findUnique({
        where: { id: designId },
      });
      
      if (!existingDesign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Design not found",
        });
      }
      
      // Only the design creator (tailor) can update it
      if (existingDesign.tailorId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this design",
        });
      }
      
      try {
        const updatedDesign = await ctx.db.design.update({
          where: { id: designId },
          data,
        });
        
        return {
          success: true,
          design: updatedDesign,
        };
      } catch (error) {
        console.error('Error updating design:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update design",
        });
      }
    }),

  // Delete a design
  deleteDesign: protectedProcedure
    .input(z.object({
      designId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find the design first to verify ownership
      const existingDesign = await ctx.db.design.findUnique({
        where: { id: input.designId },
      });
      
      if (!existingDesign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Design not found",
        });
      }
      
      // Only the design creator (tailor) can delete it
      if (existingDesign.tailorId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this design",
        });
      }
      
      try {
        await ctx.db.design.delete({
          where: { id: input.designId },
        });
        
        return {
          success: true,
          message: "Design deleted successfully",
        };
      } catch (error) {
        console.error('Error deleting design:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete design",
        });
      }
    }),
}); 