import { PrismaClient } from '@prisma/client'
import { OrderStatus } from '@prisma/client'
import { addHours } from 'date-fns'

// Initialize Prisma client
const prisma = new PrismaClient()

// Function to check and update expired pending orders
export async function checkExpiredPendingOrders() {
  try {
    const now = new Date()
    
    // Find and update orders that have passed their acceptance deadline
    const expiredOrders = await prisma.order.updateMany({
      where: {
        status: OrderStatus.PENDING,
        acceptanceDeadline: {
          lt: now,
        },
      },
      data: {
        status: OrderStatus.REJECTED,
      },
    })

    console.log(`Updated ${expiredOrders.count} expired pending orders`)

    return expiredOrders.count
  } catch (error) {
    console.error('Error checking expired pending orders:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Optional: If using a task scheduler like node-cron
// import cron from 'node-cron'
// cron.schedule('0 * * * *', checkExpiredPendingOrders) // Run every hour 