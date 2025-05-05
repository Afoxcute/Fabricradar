'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import DesignCard from './design-card';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw, Scissors } from 'lucide-react';

// Define the Design type based on the props in DesignCard
interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  averageTimeline: string;
  tailorId: number;
  tailor?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface DesignListProps {
  tailorId?: number;
  showActions?: boolean;
  limit?: number;
}

export default function DesignList({ tailorId, showActions = false, limit = 12 }: DesignListProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentCursor, setCurrentCursor] = useState<number | null>(null);
  const [cursors, setCursors] = useState<(number | null)[]>([null]); // Track pagination history
  const [currentPage, setCurrentPage] = useState(0);
  
  // Query designs based on whether we need all designs or just one tailor's designs
  const designsQuery = tailorId 
    ? api.designs.getTailorDesigns.useQuery({ 
        tailorId, 
        limit, 
        cursor: currentCursor 
      })
    : api.designs.getAllDesigns.useQuery({ 
        limit, 
        cursor: currentCursor 
      });
  
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
  
  // Handle pagination
  useEffect(() => {
    if (designsQuery.data?.nextCursor !== undefined) {
      // Only update cursors array if we have a next page
      const newCursors = [...cursors];
      newCursors[currentPage + 1] = designsQuery.data.nextCursor;
      setCursors(newCursors);
    }
  }, [designsQuery.data?.nextCursor]);

  const goToNextPage = () => {
    if (designsQuery.data?.nextCursor) {
      setCurrentCursor(designsQuery.data.nextCursor);
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentCursor(cursors[newPage]);
      setCurrentPage(newPage);
    }
  };
  
  const handleDelete = (designId: number) => {
    if (confirm('Are you sure you want to delete this design?\nThis action cannot be undone.')) {
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
  
  // Count the total designs
  const totalDesigns = designsQuery.data?.designs.length || 0;
  
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
          <div>
            <p className="font-medium">Failed to load designs</p>
            <p className="text-sm text-red-400">{designsQuery.error.message}</p>
          </div>
        </div>
      )}
      
      {/* Designs grid */}
      {designsQuery.data?.designs && designsQuery.data.designs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {designsQuery.data.designs.map((design: Design) => (
              <DesignCard
                key={design.id}
                design={design}
                showActions={showActionsAdjusted}
                onEdit={() => handleEdit(design.id)}
                onDelete={() => handleDelete(design.id)}
              />
            ))}
          </div>
          
          {/* Pagination controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {totalDesigns > 0 && (
                <>
                  Showing {totalDesigns} designs {currentPage > 0 ? `(page ${currentPage + 1})` : ''}
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 0 || designsQuery.isLoading}
                className={`p-2 rounded-lg border ${
                  currentPage === 0 
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed' 
                    : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              
              <button
                onClick={goToNextPage}
                disabled={!designsQuery.data?.nextCursor || designsQuery.isLoading}
                className={`p-2 rounded-lg border ${
                  !designsQuery.data?.nextCursor 
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed' 
                    : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            <button
              onClick={() => designsQuery.refetch()}
              disabled={designsQuery.isRefetching}
              className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 px-4 py-2 rounded-lg border border-gray-800 hover:border-cyan-900 transition-colors"
              aria-label="Refresh designs"
            >
              <RefreshCw size={16} className={designsQuery.isRefetching ? 'animate-spin' : ''} />
              <span>{designsQuery.isRefetching ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </>
      ) : (
        // Empty state (not loading and no data)
        !designsQuery.isLoading && (
          <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
            <div className="max-w-md mx-auto">
              <Scissors className="w-12 h-12 text-gray-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-2">No designs found</h3>
              <p className="text-gray-400 mb-6">
                {tailorId 
                  ? "You haven't created any designs yet. Create your first design to showcase your work." 
                  : "No designs are available at the moment."}
              </p>
              {tailorId && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
                >
                  Create a Design
                </button>
              )}
            </div>
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