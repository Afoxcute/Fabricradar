import { postRouter } from "../../server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "../../server/api/trpc";
import { userRouter } from "../api/routers/user";
import { orderRouter } from "../api/routers/order";
import { designRouter } from "../api/routers/design";
import { orderChatRouter } from "../api/routers/order-chat";
import { rewardsRouter } from "../api/routers/rewards";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  users: userRouter,
  orders: orderRouter,
  designs: designRouter,
  orderChat: orderChatRouter,
  rewards: rewardsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
