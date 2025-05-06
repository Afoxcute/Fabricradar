'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import ImageUpload from './image-upload';
import { DesignTimelinePicker } from './design-timeline-picker';
import { combine2DateAndTime } from '@/lib/utils';

interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  averageTimeline: string;
  tailorId: number;
  timelineDate?: Date;
  timelineStartTime?: string;
  timelineEndTime?: string;
}

interface DesignFormProps {
  onSuccess?: () => void;
  designToEdit?: Design | null;
  isEditing?: boolean;
}

export default function DesignForm({ 
  onSuccess, 
  designToEdit = null, 
  isEditing = false 
}: DesignFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState(isEditing && designToEdit ? designToEdit.title : '');
  const [description, setDescription] = useState(isEditing && designToEdit ? designToEdit.description : '');
  const [price, setPrice] = useState(isEditing && designToEdit ? designToEdit.price.toString() : '');
  const [averageTimeline, setAverageTimeline] = useState(isEditing && designToEdit ? designToEdit.averageTimeline : '');
  const [imageUrl, setImageUrl] = useState(isEditing && designToEdit ? designToEdit.imageUrl : null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Add timeline state
  const [timeline, setTimeline] = useState({
    date: isEditing && designToEdit?.timelineDate ? new Date(designToEdit.timelineDate) : new Date(),
    startTime: isEditing && designToEdit?.timelineStartTime ? designToEdit.timelineStartTime : '09:00',
    endTime: isEditing && designToEdit?.timelineEndTime ? designToEdit.timelineEndTime : '17:00'
  });
  
  // Fill form when editing
  useEffect(() => {
    if (isEditing && designToEdit) {
      setTitle(designToEdit.title);
      setDescription(designToEdit.description);
      setPrice(designToEdit.price.toString());
      setAverageTimeline(designToEdit.averageTimeline);
      setImageUrl(designToEdit.imageUrl || null);
      setTimeline({
        date: isEditing && designToEdit.timelineDate ? new Date(designToEdit.timelineDate) : new Date(),
        startTime: isEditing && designToEdit.timelineStartTime ? designToEdit.timelineStartTime : '09:00',
        endTime: isEditing && designToEdit.timelineEndTime ? designToEdit.timelineEndTime : '17:00'
      });
    }
  }, [isEditing, designToEdit]);
  
  // Create design mutation
  const createMutation = api.designs.createDesign.useMutation({
    onSuccess: () => handleSuccess('Design created successfully!'),
    onError: (error) => {
      setError(error.message || 'Failed to create design');
      setSuccess(false);
    },
  });
  
  // Update design mutation
  const updateMutation = api.designs.updateDesign.useMutation({
    onSuccess: () => handleSuccess('Design updated successfully!'),
    onError: (error) => {
      setError(error.message || 'Failed to update design');
      setSuccess(false);
    },
  });
  
  const handleSuccess = (message: string) => {
    // Reset form if creating new design
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setPrice('');
      setAverageTimeline('');
      setImageUrl(null);
      setTimeline({
        date: new Date(),
        startTime: '09:00',
        endTime: '17:00'
      });
    }
    
    // Show success message
    setSuccess(true);
    setError(null);
    
    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    
    // Refresh the page after a delay
    setTimeout(() => {
      router.refresh();
    }, 1000);
  };
  
  // Check if any mutation is currently loading
  const isLoading = createMutation.status === 'pending' || updateMutation.status === 'pending';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(false);
    
    // Validate form
    if (!title) {
      setError('Title is required');
      return;
    }
    
    if (!description) {
      setError('Description is required');
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!averageTimeline) {
      setError('Average timeline is required');
      return;
    }
    
    // Check if user is signed in and is a tailor
    if (!user) {
      setError('You must be signed in to manage designs');
      return;
    }
    
    if (user.accountType !== 'TAILOR') {
      setError('Only tailors can manage designs');
      return;
    }
    
    // Calculate timeline start and end times as Date objects
    const timelineStartDateTime = combine2DateAndTime(timeline.date, timeline.startTime);
    const timelineEndDateTime = combine2DateAndTime(timeline.date, timeline.endTime);
    
    // Prepare design data
    const designData = {
      title,
      description,
      price: Number(price),
      averageTimeline,
      imageUrl: imageUrl || undefined,
      timelineDate: timeline.date,
      timelineStartTime: timeline.startTime,
      timelineEndTime: timeline.endTime,
    };
    
    // Submit design - create or update
    if (isEditing && designToEdit) {
      updateMutation.mutate({
        designId: designToEdit.id,
        ...designData
      });
    } else {
      createMutation.mutate(designData);
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isEditing ? 'Edit Design' : 'Create New Design'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g. Traditional Wedding Dress"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Describe your design, materials, style, etc."
              />
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g. 99.99"
              />
            </div>
            
            {/* Average Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-1">
                Average Timeline
              </label>
              <input
                type="text"
                id="timeline"
                value={averageTimeline}
                onChange={(e) => setAverageTimeline(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g. 2-3 weeks"
              />
            </div>
          </div>
          
          {/* Timeline Picker Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-3">Design Timeline Availability</h3>
            <p className="text-gray-400 text-sm mb-4">
              Set when you're available to work on this design.
            </p>
            <DesignTimelinePicker 
              value={timeline}
              onChange={setTimeline}
            />
          </div>
          
          {/* Image Upload */}
          <ImageUpload 
            onImageUrlChange={setImageUrl} 
            initialImageUrl={isEditing && designToEdit ? designToEdit.imageUrl || '' : ''}
          />
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-900/30 border border-green-800 text-green-500 px-4 py-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <span>{isEditing ? 'Design updated successfully!' : 'Design created successfully!'}</span>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditing ? 'Update Design' : 'Create Design'}</>
              )}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
} 