'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { CloudUpload, X, Check, Image as ImageIcon, Plus, MoveHorizontal } from 'lucide-react';
import { generateUniqueFileName } from '@/utils/s3-upload';
import axios from 'axios';
import Image from 'next/image';

interface MultiImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
}

export default function MultiImageUpload({ 
  onImagesChange, 
  initialImages = [], 
  maxImages = 5 
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial images if provided
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImageUrls(initialImages);
    }
  }, [initialImages]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if we've reached the maximum number of images
    if (imageUrls.length >= maxImages) {
      setErrorMessage(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Reset state
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size should be less than 5MB');
      }

      // Generate unique filename
      const uniqueFileName = generateUniqueFileName(file.name);

      // Get presigned URL from API
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: uniqueFileName,
          fileType: file.type,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await res.json();

      // Upload file to S3 with progress tracking
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Add new image URL to the array
      const newImageUrls = [...imageUrls, fileUrl];
      setImageUrls(newImageUrls);
      onImagesChange(newImageUrls);
      setUploadProgress(100);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const imageUrl = imageUrls[index];
      if (!imageUrl) return;

      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      // Call API to delete from S3
      await fetch(`/api/delete-file?fileName=${fileName}`, {
        method: 'DELETE',
      });

      // Remove image from array
      const newImageUrls = [...imageUrls];
      newImageUrls.splice(index, 1);
      setImageUrls(newImageUrls);
      onImagesChange(newImageUrls);
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Move image to change order
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 || 
      fromIndex >= imageUrls.length || 
      toIndex < 0 || 
      toIndex >= imageUrls.length
    ) {
      return;
    }
    
    const newImageUrls = [...imageUrls];
    const [movedImage] = newImageUrls.splice(fromIndex, 1);
    newImageUrls.splice(toIndex, 0, movedImage);
    
    setImageUrls(newImageUrls);
    onImagesChange(newImageUrls);
  };

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-gray-300 mb-2">Design Images (First image will be the main display image)</div>
      
      {/* Image Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <Image 
              src={url} 
              alt={`Design image ${index + 1}`} 
              className="w-full h-full object-cover rounded-lg border border-gray-700"
              width={200}
              height={200}
              unoptimized={true}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-lg">
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
              
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2"
                  aria-label="Move left"
                  title="Move left"
                >
                  <MoveHorizontal size={16} />
                </button>
              )}
            </div>
            
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-md">
                Main
              </div>
            )}
          </div>
        ))}
        
        {/* Add Image Button */}
        {imageUrls.length < maxImages && (
          <div 
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 bg-gray-800/50 aspect-square"
          >
            {isUploading ? (
              <div className="text-center p-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-cyan-500 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <Plus size={24} className="mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">Add image</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg flex items-start gap-2 mb-4">
          <X size={18} className="mt-0.5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Help text */}
      <p className="text-xs text-gray-500 mb-2">
        Upload up to {maxImages} images (PNG, JPG or JPEG, max. 5MB each)
      </p>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 