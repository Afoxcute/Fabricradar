import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Generic data synchronization schema
const SyncDataSchema = z.object({
  model: z.string(),
  data: z.record(z.string(), z.any()),
  uniqueIdentifier: z.string().optional(),
})

/**
 * Synchronize data with the database
 * @param input Synchronization input with model, data, and optional unique identifier
 * @returns Synchronized database record
 */
export async function syncData(input: z.infer<typeof SyncDataSchema>) {
  const { model, data, uniqueIdentifier } = SyncDataSchema.parse(input)

  try {
    // Dynamic model selection based on input
    const modelMap: Record<string, any> = {
      'User': prisma.user,
      'Order': prisma.order,
      'Design': prisma.design,
    }

    const selectedModel = modelMap[model]

    if (!selectedModel) {
      throw new Error(`Model ${model} not found`)
    }

    // Upsert logic: update if exists, create if not
    const syncedRecord = await selectedModel.upsert({
      where: uniqueIdentifier 
        ? { [uniqueIdentifier]: data[uniqueIdentifier] } 
        : { id: data.id || 0 },
      update: data,
      create: data,
    })

    return syncedRecord
  } catch (error) {
    console.error('Data synchronization error:', error)
    throw error
  }
}

/**
 * Bulk synchronize multiple records
 * @param inputs Array of synchronization inputs
 * @returns Array of synchronized records
 */
export async function bulkSyncData(inputs: z.infer<typeof SyncDataSchema>[]) {
  return Promise.all(inputs.map(syncData))
}

// Example usage for different models
export const UserSyncSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  walletAddress: z.string().optional(),
})

export const OrderSyncSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  status: z.enum(['PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED']),
  price: z.number(),
})

export const DesignSyncSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
}) 