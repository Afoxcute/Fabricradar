import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { OrderStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const orderRouter = createTRPCRouter({
  // Get order summary for a tailor (total, pending, completed)
  getTailorOrderSummary: publicProcedure
    .input(z.object({ tailorId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Check if the user has permission to access this data
      if (!ctx.user || (ctx.user.id !== input.tailorId && ctx.user.accountType !== "TAILOR")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to access this data",
        });
      }

      // Get total orders count
      const totalOrders = await ctx.db.order.count({
        where: {
          tailorId: input.tailorId,
        },
      });

      // Get pending orders count
      const pendingOrders = await ctx.db.order.count({
        where: {
          tailorId: input.tailorId,
          status: OrderStatus.PENDING,
        },
      });

      // Get completed orders count
      const completedOrders = await ctx.db.order.count({
        where: {
          tailorId: input.tailorId,
          status: OrderStatus.COMPLETED,
        },
      });

      // Get total revenue
      const revenueResult = await ctx.db.order.aggregate({
        where: {
          tailorId: input.tailorId,
          status: OrderStatus.COMPLETED,
        },
        _sum: {
          price: true,
        },
      });

      const totalRevenue = revenueResult._sum.price || 0;

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
      };
    }),

  // Get recent orders for a tailor
  getTailorRecentOrders: publicProcedure
    .input(z.object({ 
      tailorId: z.number(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if the user has permission to access this data
      if (!ctx.user || (ctx.user.id !== input.tailorId && ctx.user.accountType !== "TAILOR")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to access this data",
        });
      }

      const { limit, cursor } = input;

      const orders = await ctx.db.order.findMany({
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
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        orders,
        nextCursor,
      };
    }),

  // Update order status
  updateOrderStatus: publicProcedure
    .input(z.object({ 
      orderId: z.number(),
      status: z.enum([
        "PENDING",
        "ACCEPTED",
        "COMPLETED", 
        "REJECTED"
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the user has permission to update this order
      if (!ctx.user || (ctx.user.id !== order.tailorId && ctx.user.accountType !== "TAILOR")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to update this order",
        });
      }

      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: { status: input.status as OrderStatus },
      });

      return updatedOrder;
    }),
}); 