import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

// Define the interface for the order properties we need
interface OrderWithId {
  id: number;
}

// This endpoint will be called by a CRON job to periodically check
// for expired order acceptance deadlines and automatically reject them
export async function GET(request: NextRequest) {
  try {
    // Find all pending orders where the acceptance deadline has passed
    // and they haven't been accepted yet
    const expiredOrders = await db.order.findMany({
      where: {
        status: "PENDING",
        isAccepted: false,
        acceptanceDeadline: {
          lt: new Date() // Only orders where deadline has passed
        }
      },
    });

    // Update all expired orders to REJECTED status
    if (expiredOrders.length > 0) {
      await db.order.updateMany({
        where: {
          id: {
            in: expiredOrders.map((order: OrderWithId) => order.id)
          }
        },
        data: {
          status: "REJECTED",
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      processed: expiredOrders.length,
      message: `Processed ${expiredOrders.length} expired orders`
    });
  } catch (error: any) {
    console.error('Error checking order deadlines:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while checking order deadlines' 
      },
      { status: 500 }
    );
  }
} 