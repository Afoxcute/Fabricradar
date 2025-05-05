import { useState } from 'react'
import { api } from '@/trpc/react'
import { toast } from 'react-hot-toast'

export function useDataSync<T>(model: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const syncMutation = api.orders.createOrder.useMutation({
    onMutate: () => {
      setIsLoading(true)
      setError(null)
    },
    onSuccess: (result) => {
      setData(result.order as T)
      toast.success(result.message)
    },
    onError: (error) => {
      setError(error.message)
      toast.error('Synchronization failed')
    },
    onSettled: () => {
      setIsLoading(false)
    }
  })

  const syncData = (data: any) => {
    syncMutation.mutate(data)
  }

  return {
    syncData,
    data,
    isLoading,
    error
  }
}

// Example usage for different models
export function useOrderSync() {
  return useDataSync('Order')
}

export function useUserSync() {
  return useDataSync('User')
}

export function useDesignSync() {
  return useDataSync('Design')
} 