export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  description: string | null;
  price: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  tailorId: number;
  acceptanceDeadline: Date | null; // Changed from string | undefined to Date | null
  acceptedAt: Date | null;
  // Add any other fields from your API response
  measurements?: any; // Add if needed
  txHash?: string | null; // Add if needed
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';
export type ActiveTab = 'pending-acceptance' | 'all' | 'active' | 'completed';
