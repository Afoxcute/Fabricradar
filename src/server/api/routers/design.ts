import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const designRouter = createTRPCRouter({
  // Create a new design
  createDesign: publicProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      price: z.number().positive("Price must be positive"),
      imageUrl: z.string().optional(),
      averageTimeline: z.string().min(1, "Average timeline is required"),
      tailorId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify user is a tailor
        const user = await ctx.db.user.findUnique({
          where: { id: input.tailorId },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (user.accountType !== "TAILOR") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only tailors can create designs",
          });
        }

        // Create the design
        const design = await ctx.db.design.create({
          data: {
            title: input.title,
            description: input.description,
            price: input.price,
            imageUrl: input.imageUrl,
            averageTimeline: input.averageTimeline,
            tailorId: input.tailorId,
          },
        });

        return {
          success: true,
          design,
          message: 'Design created successfully',
        };
      } catch (error) {
        console.error('Error creating design:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create design',
        });
      }
    }),

  // Get designs for a tailor
  getTailorDesigns: publicProcedure
    .input(z.object({ 
      tailorId: z.number(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const designs = await ctx.db.design.findMany({
        where: {
          tailorId: input.tailorId,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (designs.length > limit) {
        const nextItem = designs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        designs,
        nextCursor,
      };
    }),

  // Get all designs (for homepage)
  getAllDesigns: publicProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const designs = await ctx.db.design.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
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

      let nextCursor: typeof cursor | undefined = undefined;
      if (designs.length > limit) {
        const nextItem = designs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        designs,
        nextCursor,
      };
    }),

  // Get design by ID
  getDesignById: publicProcedure
    .input(z.object({ designId: z.number() }))
    .query(async ({ ctx, input }) => {
      const design = await ctx.db.design.findUnique({
        where: { id: input.designId },
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
      
      if (!design) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Design not found",
        });
      }
      
      return design;
    }),

  // Update a design
  updateDesign: publicProcedure
    .input(z.object({
      designId: z.number(),
      title: z.string().min(1, "Title is required").optional(),
      description: z.string().min(1, "Description is required").optional(),
      price: z.number().positive("Price must be positive").optional(),
      imageUrl: z.string().optional(),
      averageTimeline: z.string().min(1, "Average timeline is required").optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const design = await ctx.db.design.findUnique({
          where: { id: input.designId },
        });

        if (!design) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Design not found",
          });
        }

        // Verify user is the owner of the design
        if (ctx.user && ctx.user.id !== design.tailorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this design",
          });
        }

        // Update the design
        const updatedDesign = await ctx.db.design.update({
          where: { id: input.designId },
          data: {
            ...(input.title && { title: input.title }),
            ...(input.description && { description: input.description }),
            ...(input.price && { price: input.price }),
            ...(input.imageUrl && { imageUrl: input.imageUrl }),
            ...(input.averageTimeline && { averageTimeline: input.averageTimeline }),
          },
        });

        return {
          success: true,
          design: updatedDesign,
          message: 'Design updated successfully',
        };
      } catch (error) {
        console.error('Error updating design:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update design',
        });
      }
    }),

  // Delete a design
  deleteDesign: publicProcedure
    .input(z.object({ designId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const design = await ctx.db.design.findUnique({
          where: { id: input.designId },
        });

        if (!design) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Design not found",
          });
        }

        // Verify user is the owner of the design
        if (ctx.user && ctx.user.id !== design.tailorId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this design",
          });
        }

        // Delete the design
        await ctx.db.design.delete({
          where: { id: input.designId },
        });

        return {
          success: true,
          message: 'Design deleted successfully',
        };
      } catch (error) {
        console.error('Error deleting design:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete design',
        });
      }
    }),
}); 