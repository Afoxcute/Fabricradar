import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { OrderStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const orderRouter = createTRPCRouter({
  // Create a new order
  createOrder: publicProcedure
    .input(z.object({
      productName: z.string(),
      customerName: z.string(),
      userId: z.number().optional(),
      tailorId: z.number(),
      price: z.number(),
      txHash: z.string().optional(),
      description: z.string().optional(),
      measurements: z.record(z.string(), z.string()).optional(),
      delivery: z.object({
        method: z.string(),
        address: z.string().optional(),
        timeline: z.string().optional(),
        customTimeline: z.object({
          startDate: z.string(),
          startTime: z.string(),
          endDate: z.string(),
          endTime: z.string()
        }).optional()
      }).optional(),
      paymentMethod: z.string().optional(),
      designId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate unique order number with format ORD-YYYYMMDD-XXXX (where XXXX is a random alphanumeric string)
        const date = new Date();
        const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `ORD-${datePart}-${randomPart}`;

        // Calculate acceptance deadline (48 hours from now)
        const acceptanceDeadline = new Date();
        acceptanceDeadline.setHours(acceptanceDeadline.getHours() + 48);

        // Create the order
        const order = await ctx.db.order.create({
          data: {
            orderNumber,
            customerName: input.customerName,
            userId: input.userId || 0, // Use 0 as default if no user ID (guest checkout)
            tailorId: input.tailorId,
            status: OrderStatus.PENDING,
            price: input.price,
            txHash: input.txHash,
            description: input.description,
            measurements: input.measurements || {},
            designId: input.designId,
            acceptanceDeadline,
            isAccepted: false,
          },
        });

        return {
          success: true,
          order,
          message: 'Order created successfully',
        };
      } catch (error) {
        console.error('Error creating order:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create order',
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

  // Get pending acceptance orders for a tailor
  getPendingAcceptanceOrders: publicProcedure
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
          status: OrderStatus.PENDING,
          isAccepted: false,
          acceptanceDeadline: {
            gt: new Date() // Only orders where deadline hasn't passed
          }
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

  // Get detailed order information by ID
  getOrderById: publicProcedure
    .input(z.object({ 
      orderId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        }
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the user has permission to view this order
      // Allow either the customer or the tailor to view the order
      if (!ctx.user || (ctx.user.id !== order.userId && ctx.user.id !== order.tailorId && ctx.user.accountType !== "TAILOR")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to view this order",
        });
      }

      return {
        order,
      };
    }),

  // Accept or reject an order
  acceptOrder: publicProcedure
    .input(z.object({ 
      orderId: z.number(),
      accept: z.boolean(),
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

      // Check if the acceptance deadline has passed
      const now = new Date();
      if (order.acceptanceDeadline && order.acceptanceDeadline < now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The acceptance deadline has passed",
        });
      }

      if (input.accept) {
        // Accept the order
        const updatedOrder = await ctx.db.order.update({
          where: { id: input.orderId },
          data: { 
            isAccepted: true,
            status: OrderStatus.ACCEPTED,
            acceptedAt: new Date(),
          },
        });

        return {
          success: true,
          order: updatedOrder,
          message: 'Order accepted successfully',
        };
      } else {
        // Reject the order
        const updatedOrder = await ctx.db.order.update({
          where: { id: input.orderId },
          data: { 
            isAccepted: false,
            status: OrderStatus.REJECTED,
          },
        });

        return {
          success: true,
          order: updatedOrder,
          message: 'Order rejected successfully',
        };
      }
    }),
}); 