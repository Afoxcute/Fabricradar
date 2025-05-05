import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { OrderService } from '@/services/OrderService';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const userId = request.nextUrl.searchParams.get('userId');
    const limit = request.nextUrl.searchParams.get('limit') || '10';
    
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { error: 'Invalid or missing userId parameter' },
        { status: 400 }
      );
    }
    
    const orderService = new OrderService(db);
    const orders = await orderService.getRecentTailorOrders(
      Number(userId),
      Number(limit)
    );
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    
    // Return an empty array instead of an error to prevent UI breakage
    return NextResponse.json([]);
  }
} 