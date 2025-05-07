import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const orderChatRouter = createTRPCRouter({
  // Get chat messages for an order
  getOrderChatMessages: publicProcedure
    .input(z.object({ 
      orderId: z.number() 
    }))
    .query(async ({ ctx, input }) => {
      // Get the order to check permissions
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the user has permission to access this order's chat
      if (!ctx.user || (ctx.user.id !== order.tailorId && ctx.user.id !== order.userId)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to access this order's chat",
        });
      }

      // Get chat messages for this order
      const messages = await ctx.db.orderChatMessage.findMany({
        where: { orderId: input.orderId },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              accountType: true
            }
          }
        }
      });

      // Transform the messages for the client
      const transformedMessages = messages.map(msg => ({
        id: msg.id.toString(),
        sender: msg.userType,
        message: msg.message,
        timestamp: msg.createdAt.toISOString(),
        senderName: msg.user ? `${msg.user.firstName || ''} ${msg.user.lastName || ''}`.trim() : undefined
      }));

      return {
        messages: transformedMessages,
      };
    }),

  // Send a chat message for an order
  sendOrderChatMessage: publicProcedure
    .input(z.object({ 
      orderId: z.number(),
      message: z.string().min(1).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to send messages",
        });
      }

      // Get the order to check permissions
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the user has permission to send messages for this order
      if (ctx.user.id !== order.tailorId && ctx.user.id !== order.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to send messages for this order",
        });
      }

      // Determine if the sender is a tailor or a customer
      const userType = ctx.user.id === order.tailorId ? "TAILOR" : "CUSTOMER";

      // Create the chat message
      const message = await ctx.db.orderChatMessage.create({
        data: {
          orderId: input.orderId,
          userId: ctx.user.id,
          userType,
          message: input.message,
        },
      });

      return {
        success: true,
        messageId: message.id,
      };
    }),
}); 