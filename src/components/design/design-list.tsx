'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import DesignCard from './design-card';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface DesignListProps {
  tailorId?: number;
  showActions?: boolean;
  limit?: number;
}

export default function DesignList({ tailorId, showActions = false, limit = 20 }: DesignListProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Query designs based on whether we need all designs or just one tailor's designs
  const designsQuery = tailorId 
    ? api.designs.getTailorDesigns.useQuery({ tailorId, limit })
    : api.designs.getAllDesigns.useQuery({ limit });
  
  // Delete mutation
  const deleteMutation = api.designs.deleteDesign.useMutation({
    onMutate: () => {
      setIsDeleting(true);
      setDeleteError(null);
    },
    onSuccess: () => {
      // Refetch designs
      designsQuery.refetch();
    },
    onError: (error) => {
      setDeleteError(error.message || 'Failed to delete design');
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });
  
  const handleDelete = (designId: number) => {
    if (confirm('Are you sure you want to delete this design?')) {
      deleteMutation.mutate({ designId });
    }
  };
  
  const handleEdit = (designId: number) => {
    // For now, we'll just show an alert
    alert(`Edit design ${designId} (Edit functionality to be implemented)`);
  };
  
  // Check if user is the owner of designs
  const canManageDesigns = tailorId && user ? user.id === tailorId : false;
  // Ensure this is explicitly a boolean value
  const showActionsAdjusted: boolean = Boolean(showActions && canManageDesigns);
  
  return (
    <div>
      {/* Loading state */}
      {designsQuery.isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={24} className="animate-spin text-cyan-500" />
          <span className="ml-2 text-gray-400">Loading designs...</span>
        </div>
      )}
      
      {/* Error state */}
      {designsQuery.error && (
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 my-4">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>Failed to load designs: {designsQuery.error.message}</span>
        </div>
      )}
      
      {/* Designs grid */}
      {designsQuery.data?.designs && designsQuery.data.designs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {designsQuery.data.designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                showActions={showActionsAdjusted}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
          {/* Refresh and view more buttons */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => designsQuery.refetch()}
              disabled={designsQuery.isRefetching}
              className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 px-4 py-2 rounded-lg border border-gray-800 hover:border-cyan-900 transition-colors"
            >
              <RefreshCw size={16} className={designsQuery.isRefetching ? 'animate-spin' : ''} />
              <span>{designsQuery.isRefetching ? 'Refreshing...' : 'Refresh Designs'}</span>
            </button>
          </div>
        </>
      ) : (
        // Empty state (not loading and no data)
        !designsQuery.isLoading && (
          <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
            <p className="text-gray-400">No designs found.</p>
            {tailorId && (
              <p className="text-gray-500 mt-1">Create your first design to get started.</p>
            )}
          </div>
        )
      )}
      
      {/* Delete error */}
      {deleteError && (
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 mt-4">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}
      
      {/* Delete loading state overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-4 rounded-lg flex items-center gap-3">
            <Loader2 size={24} className="animate-spin text-cyan-500" />
            <span className="text-white">Deleting design...</span>
          </div>
        </div>
      )}
    </div>
  );
} 