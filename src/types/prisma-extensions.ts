// import { Prisma as PrismaNamespace } from '@prisma/client';
import { OrderProgress } from './order';
import { JsonValue, JsonObject, JsonArray } from './json';

/**
 * This file extends Prisma's generated types to include the progress field
 * in Order models, which is stored as a JSON field in the database.
 */

declare global {
  namespace PrismaJson {
    type OrderProgressJSON = OrderProgress;
  }
}

// Type for adding progress field to Order type
export type OrderWithProgress = {
  progress?: OrderProgress | null;
};

// Define additional JSON types needed for Prisma
type NullableJsonInput = JsonValue | { toJSON: () => JsonValue };

// Define our own input types without relying on Prisma namespace
export interface OrderUpdateInput {
  progress?: NullableJsonInput | { set?: JsonValue } | null;
}

export interface OrderUncheckedUpdateInput {
  progress?: NullableJsonInput | { set?: JsonValue } | null;
}

export interface OrderCreateInput {
  progress?: JsonValue;
}

export interface OrderUncheckedCreateInput {
  progress?: JsonValue;
} 