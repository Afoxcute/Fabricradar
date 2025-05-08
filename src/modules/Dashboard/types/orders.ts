import { JsonValue } from '@prisma/client/runtime/library';

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface PrismaOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  status: string;
  price: number;
  txHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  tailorId: number;
  description: string | null;
  measurements: JsonValue;
}

export interface OrderTableRow {
  key: string;
  id: string;
  originalId: number;
  customer: string;
  status: string;
  date: string;
  price: string;
  orderId: number;
}
