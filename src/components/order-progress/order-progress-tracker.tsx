'use client';

import React from 'react';
import { Check, Clock, Scissors, Ruler, Truck, Loader2 } from 'lucide-react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface OrderProgressTrackerProps {
  orderId: number;
  status: string;
  isTailor?: boolean;
}

// Define milestones with their requirements and descriptions
const milestones = [
  { 
    id: 'order_placed', 
    label: 'Order Placed', 
    description: 'Your order has been placed successfully', 
    icon: <Clock className="h-5 w-5" />,
    requiresStatus: ['PENDING', 'ACCEPTED', 'COMPLETED']
  },
  { 
    id: 'order_accepted', 
    label: 'Order Accepted', 
    description: 'Your order has been accepted by the tailor', 
    icon: <Check className="h-5 w-5" />,
    requiresStatus: ['ACCEPTED', 'COMPLETED']
  },
  { 
    id: 'measurements_confirmed', 
    label: 'Measurements Confirmed', 
    description: 'Measurements have been confirmed', 
    icon: <Ruler className="h-5 w-5" />,
    requiresProgress: 'measurements_confirmed'
  },
  { 
    id: 'cutting_started', 
    label: 'Cutting Started', 
    description: 'Fabric cutting has begun', 
    icon: <Scissors className="h-5 w-5" />,
    requiresProgress: 'cutting_started'
  },
  { 
    id: 'sewing_progress', 
    label: 'Sewing In Progress', 
    description: 'Your garment is being sewn', 
    icon: <Scissors className="h-5 w-5" rotate={45} />,
    requiresProgress: 'sewing_progress'
  },
  { 
    id: 'final_checks', 
    label: 'Final Checks', 
    description: 'Final quality checks in progress', 
    icon: <Check className="h-5 w-5" />,
    requiresProgress: 'final_checks'
  },
  { 
    id: 'ready_for_delivery', 
    label: 'Ready For Delivery', 
    description: 'Your order is ready for delivery or pickup', 
    icon: <Truck className="h-5 w-5" />,
    requiresProgress: 'ready_for_delivery'
  },
  { 
    id: 'order_completed', 
    label: 'Order Completed', 
    description: 'Your order has been completed', 
    icon: <Check className="h-5 w-5" />,
    requiresStatus: ['COMPLETED']
  },
];

export function OrderProgressTracker({ orderId, status, isTailor = false }: OrderProgressTrackerProps) {
  const { user } = useAuth();
  
  // Fetch order progress from the API
  const { 
    data: progressData, 
    isLoading: isLoadingProgress,
    refetch: refetchProgress
  } = api.orders.getOrderProgress.useQuery(
    { orderId },
    { enabled: Boolean(orderId) && Boolean(user?.id) }
  );
  
  // Update progress milestone mutation
  const updateProgressMutation = api.orders.updateOrderProgress.useMutation({
    onSuccess: () => {
      refetchProgress();
      toast.success('Progress updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update progress');
    }
  });
  
  // Handle update progress
  const handleUpdateProgress = (milestoneId: string, completed: boolean) => {
    if (!orderId || !user?.id) return;
    
    updateProgressMutation.mutate({
      orderId,
      milestone: milestoneId,
      completed
    });
  };
  
  // Check if a milestone is completed
  const isMilestoneCompleted = (milestone: typeof milestones[0]) => {
    if (isLoadingProgress || !progressData) return false;
    
    // Check if status requirements are met
    if (milestone.requiresStatus && !milestone.requiresStatus.includes(status)) {
      return false;
    }
    
    // Check if progress-specific requirements are met
    if (milestone.requiresProgress) {
      return progressData.progress[milestone.requiresProgress] === true;
    }
    
    // For order_placed, always true if we have the order
    if (milestone.id === 'order_placed') return true;
    
    // For order_accepted, check status
    if (milestone.id === 'order_accepted') return status === 'ACCEPTED' || status === 'COMPLETED';
    
    // For order_completed, check status
    if (milestone.id === 'order_completed') return status === 'COMPLETED';
    
    return false;
  };
  
  if (isLoadingProgress) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        <span className="ml-2 text-gray-400">Loading progress...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-3.5 top-8 h-full w-0.5 bg-gray-700" />
        
        {/* Milestones */}
        <div className="space-y-8">
          {milestones.map((milestone, index) => {
            const isCompleted = isMilestoneCompleted(milestone);
            const isLast = index === milestones.length - 1;
            
            return (
              <div key={milestone.id} className="relative flex items-start">
                {/* Milestone Icon */}
                <div 
                  className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center z-10 
                  ${isCompleted 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-gray-700 text-gray-400'}`}
                >
                  {milestone.icon}
                </div>
                
                {/* Milestone Content */}
                <div className="ml-4 flex-1">
                  <h4 className={`text-base font-medium ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                    {milestone.label}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {milestone.description}
                  </p>
                  
                  {/* Update buttons for tailors */}
                  {isTailor && milestone.requiresProgress && (
                    <div className="mt-2">
                      {isCompleted ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 text-gray-400 hover:bg-gray-800"
                          onClick={() => handleUpdateProgress(milestone.requiresProgress!, false)}
                          disabled={updateProgressMutation.isPending}
                        >
                          Mark as Incomplete
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-cyan-600 hover:bg-cyan-700"
                          onClick={() => handleUpdateProgress(milestone.requiresProgress!, true)}
                          disabled={updateProgressMutation.isPending}
                        >
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Hide the vertical line after the last item */}
                {isLast && (
                  <div className="absolute left-3.5 top-7 h-full w-0.5 bg-gray-900" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 