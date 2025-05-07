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

// Extend Prisma namespace for InputTypes
declare namespace Prisma {
  interface OrderUpdateInput {
    progress?: PrismaNamespace.InputJsonValue | PrismaNamespace.NullableJsonNullValueInput;
  }
  
  interface OrderUncheckedUpdateInput {
    progress?: PrismaNamespace.InputJsonValue | PrismaNamespace.NullableJsonNullValueInput;
  }
  
  interface OrderCreateInput {
    progress?: PrismaNamespace.InputJsonValue;
  }
  
  interface OrderUncheckedCreateInput {
    progress?: PrismaNamespace.InputJsonValue;
  }
} 