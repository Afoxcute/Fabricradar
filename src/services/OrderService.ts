import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';

// Define OrderStatus enum manually as it's not yet generated in Prisma client
export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

// Mock data for development when DB isn't available
const MOCK_ORDERS = [
  {
    id: 1,
    orderId: 'ORD001',
    tailorId: 1,
    customerId: 2,
    status: OrderStatus.PENDING,
    price: 10.0,
    txHash: '0xabc123456789def',
    date: new Date('2025-05-01'),
    customer: {
      firstName: 'Jane',
      lastName: 'Doe'
    }
  },
  {
    id: 2,
    orderId: 'ORD002',
    tailorId: 1,
    customerId: 3,
    status: OrderStatus.COMPLETED,
    price: 15.0,
    txHash: '0xdef456789abc123',
    date: new Date('2025-04-28'),
    customer: {
      firstName: 'John',
      lastName: 'Smith'
    }
  },
  {
    id: 3,
    orderId: 'ORD003',
    tailorId: 1,
    customerId: 4,
    status: OrderStatus.IN_PROGRESS,
    price: 25.0,
    txHash: null,
    date: new Date('2025-05-02'),
    customer: {
      firstName: 'Robert',
      lastName: 'Johnson'
    }
  }
];

export class OrderService extends BaseService {
  constructor(db: PrismaClient) {
    super(db);
  }

  /**
   * Check if the Order model is available in the Prisma client
   * @returns boolean - True if the Order model exists, false otherwise
   */
  private hasOrderModel(): boolean {
    // @ts-ignore - Safely check if the order property exists on db
    return !!this.db.order;
  }

  /**
   * Get order metrics for a specific tailor
   * @param tailorId - The tailor's user ID
   * @returns Promise<OrderMetrics> - Order metrics including counts and revenue
   */
  async getTailorOrderMetrics(tailorId: number): Promise<OrderMetrics> {
    try {
      // Check if Order model exists in Prisma client
      if (!this.hasOrderModel()) {
        console.log('Order model not available, using mock data instead');
        return this.getMockMetrics(tailorId);
      }

      // Get total orders
      // @ts-ignore - We've already checked that order exists
      const totalOrders = await this.db.order.count({
        where: {
          tailorId,
        },
      });

      // Get pending orders
      // @ts-ignore - We've already checked that order exists
      const pendingOrders = await this.db.order.count({
        where: {
          tailorId,
          status: OrderStatus.PENDING,
        },
      });

      // Get completed orders
      // @ts-ignore - We've already checked that order exists
      const completedOrders = await this.db.order.count({
        where: {
          tailorId,
          status: OrderStatus.COMPLETED,
        },
      });

      // Calculate total revenue from completed orders
      // @ts-ignore - We've already checked that order exists
      const revenueResult = await this.db.order.aggregate({
        where: {
          tailorId,
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
    } catch (error) {
      console.error('Error getting tailor order metrics:', error);
      // Return mock metrics in case of error
      return this.getMockMetrics(tailorId);
    }
  }

  /**
   * Get recent orders for a tailor
   * @param tailorId - The tailor's user ID
   * @param limit - Maximum number of orders to return
   * @returns Promise<Order[]> - List of recent orders
   */
  async getRecentTailorOrders(tailorId: number, limit: number = 10) {
    try {
      // Check if Order model exists in Prisma client
      if (!this.hasOrderModel()) {
        console.log('Order model not available, using mock data instead');
        return MOCK_ORDERS.filter(order => order.tailorId === tailorId).slice(0, limit);
      }

      // @ts-ignore - We've already checked that order exists
      return await this.db.order.findMany({
        where: {
          tailorId,
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting recent tailor orders:', error);
      // Return mock orders in case of error
      return MOCK_ORDERS.filter(order => order.tailorId === tailorId).slice(0, limit);
    }
  }

  /**
   * Get mock metrics for development
   * @param tailorId - The tailor's user ID
   * @returns OrderMetrics - Mock metrics based on mock orders
   */
  private getMockMetrics(tailorId: number): OrderMetrics {
    const filteredOrders = MOCK_ORDERS.filter(order => order.tailorId === tailorId);
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(order => order.status === OrderStatus.PENDING).length;
    const completedOrders = filteredOrders.filter(order => order.status === OrderStatus.COMPLETED).length;
    
    const totalRevenue = filteredOrders
      .filter(order => order.status === OrderStatus.COMPLETED)
      .reduce((sum, order) => sum + order.price, 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    };
  }
} 