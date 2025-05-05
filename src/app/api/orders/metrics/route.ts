import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { OrderService } from '@/services/OrderService';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: 'Invalid or missing userId parameter' },
        { status: 400 }
      );
    }
    
    const orderService = new OrderService(db);
    const metrics = await orderService.getTailorOrderMetrics(Number(userId));
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching order metrics:', error);
    
    // Return fallback data in production to prevent UI breakage
    return NextResponse.json({
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    });
  }
} 