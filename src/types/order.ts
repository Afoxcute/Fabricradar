import { Order, OrderStatus } from "@prisma/client";

// Define the progress structure for order tracking
export interface OrderProgress {
  measurements_confirmed?: boolean;
  cutting_started?: boolean;
  sewing_progress?: boolean;
  final_checks?: boolean;
  ready_for_delivery?: boolean;
  [key: string]: boolean | undefined; // Allow any string keys
}

// We don't need to extend the Order type since we're extending it in prisma-extensions.ts
// Remove this type and use the original Order type from Prisma
// export interface OrderWithProgress extends Order {
//   progress: OrderProgress | null;
// }

// Type for updating order progress
export interface OrderProgressUpdate {
  milestone: string;
  completed: boolean;
} 