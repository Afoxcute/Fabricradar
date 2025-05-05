'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { api } from '@/trpc/react'
import { toast } from 'react-hot-toast'
import { OrderStatus } from '@prisma/client'

interface TailorOrderActionsProps {
  orderId: number
  currentStatus: OrderStatus
  onStatusUpdate?: (newStatus: OrderStatus) => void
}

export function TailorOrderActions({ 
  orderId, 
  currentStatus, 
  onStatusUpdate 
}: TailorOrderActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Mutation to update order status
  const updateOrderStatusMutation = api.orders.updateOrderStatus.useMutation({
    onMutate: () => {
      setIsLoading(true)
    },
    onSuccess: (updatedOrder) => {
      toast.success(`Order ${updatedOrder.status.toLowerCase()}`)
      onStatusUpdate?.(updatedOrder.status)
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`)
    },
    onSettled: () => {
      setIsLoading(false)
    }
  })

  // Handler for accepting the order
  const handleAcceptOrder = () => {
    updateOrderStatusMutation.mutate({
      orderId,
      status: 'ACCEPTED'
    })
  }

  // Handler for rejecting the order
  const handleRejectOrder = () => {
    updateOrderStatusMutation.mutate({
      orderId,
      status: 'REJECTED'
    })
  }

  // Determine if actions are available based on current status
  const canTakeAction = currentStatus === 'PENDING'

  return (
    <div className="flex space-x-4">
      {canTakeAction && (
        <>
          <Button 
            onClick={handleAcceptOrder} 
            disabled={isLoading || !canTakeAction}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? 'Processing...' : 'Accept Order'}
          </Button>
          <Button 
            onClick={handleRejectOrder} 
            disabled={isLoading || !canTakeAction}
            variant="destructive"
          >
            {isLoading ? 'Processing...' : 'Reject Order'}
          </Button>
        </>
      )}
      {!canTakeAction && (
        <p className="text-gray-500">
          Order is no longer pending: {currentStatus}
        </p>
      )}
    </div>
  )
} 