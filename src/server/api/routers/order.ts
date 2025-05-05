import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { OrderStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { addHours } from "date-fns";
import { syncData } from "@/lib/data-sync";

export const orderRouter = createTRPCRouter({
  // Create a new order with enhanced synchronization
  createOrder: publicProcedure
    .input(z.object({
      productName: z.string(),
      customerName: z.string(),
      userId: z.number().optional().nullable(),
      tailorId: z.number().optional().nullable(),
      price: z.number(),
      txHash: z.string(),
      description: z.string().optional(),
      measurements: z.record(z.string(), z.string()).optional(),
      delivery: z.object({
        method: z.string(),
        address: z.string().optional().nullable(),
        timeline: z.string().optional(),
      }).optional(),
      paymentMethod: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate unique order number with format ORD-YYYYMMDD-XXXX
        const date = new Date();
        const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `ORD-${datePart}-${randomPart}`;

        // Set acceptance deadline to 48 hours from now
        const acceptanceDeadline = addHours(new Date(), 48);

        // Prepare order data for synchronization
        const orderData = {
          model: 'Order',
          data: {
            orderNumber,
            customerName: input.customerName,
            userId: input.userId || 0,
            tailorId: input.tailorId || 0,
            status: OrderStatus.PENDING,
            price: input.price,
            txHash: input.txHash,
            description: input.description || `Order for ${input.productName}`,
            measurements: input.measurements || {},
            delivery: {
              method: input.delivery?.method || 'shipping',
              address: input.delivery?.address || null,
              timeline: input.delivery?.timeline || '14',
            },
            paymentMethod: input.paymentMethod || 'crypto',
            acceptanceDeadline: acceptanceDeadline,
          },
          uniqueIdentifier: 'orderNumber',
        }

        // Synchronize order data
        const order = await syncData(orderData)

        return {
          success: true,
          order,
          message: 'Order created and synchronized successfully. Waiting for tailor acceptance.',
        };
      } catch (error) {
        console.error('Error creating order:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create and synchronize order',
        });
      }
    }),

  // Get orders for a customer
  getCustomerOrders: publicProcedure
    .input(z.object({ 
      userId: z.number(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      // Check if the user has permission to access this data
      if (!ctx.user || (ctx.user.id !== input.userId)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to access this data",
        });
      }

      const { limit, cursor } = input;

      const orders = await ctx.db.order.findMany({
        where: {
          userId: input.userId,
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

  // Add a method to check and update expired pending orders
  checkExpiredPendingOrders: publicProcedure
    .mutation(async ({ ctx }) => {
      const now = new Date();
      
      // Find and update orders that have passed their acceptance deadline
      const expiredOrders = await ctx.db.order.updateMany({
        where: {
          status: OrderStatus.PENDING,
          acceptanceDeadline: {
            lt: now,
          },
        },
        data: {
          status: OrderStatus.REJECTED,
        },
      });

      return {
        updatedCount: expiredOrders.count,
        message: 'Expired pending orders have been updated',
      };
    }),
}); 