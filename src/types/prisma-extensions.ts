import { Prisma as PrismaNamespace } from '@prisma/client';
import { OrderProgress } from './order';

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

// Define JSON value types
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [Key in string]?: JsonValue };
type JsonArray = JsonValue[];
type NullableJsonInput = JsonValue | { toJSON: () => JsonValue };

// Extend Prisma namespace for InputTypes
declare namespace Prisma {
  interface OrderUpdateInput {
    progress?: NullableJsonInput | { set?: JsonValue } | null;
  }
  
  interface OrderUncheckedUpdateInput {
    progress?: NullableJsonInput | { set?: JsonValue } | null;
  }
  
  interface OrderCreateInput {
    progress?: JsonValue;
  }
  
  interface OrderUncheckedCreateInput {
    progress?: JsonValue;
  }
} 