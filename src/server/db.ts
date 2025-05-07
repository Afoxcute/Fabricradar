// Use a simple require approach to bypass TypeScript's strict module typing
// @ts-ignore - Ignore TypeScript errors for this import
const { PrismaClient } = require('@prisma/client');

import { env } from "../../src/env";

// Create a prisma client with the correct log level
const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "production" ? ["query", "error", "warn"] : ["error"],
  });

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;