'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { CloudUpload, X, Check, Image as ImageIcon } from 'lucide-react';
import { generateUniqueFileName } from '@/utils/s3-upload';
import axios from 'axios';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUrlChange: (url: string) => void;
}

export default function ImageUpload({ onImageUrlChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      // Update state with image URL
      setImageUrl(fileUrl);
      onImageUrlChange(fileUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setImageUrl(null);
      onImageUrlChange('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      // Call API to delete from S3
      await fetch(`/api/delete-file?fileName=${fileName}`, {
        method: 'DELETE',
      });

      // Reset state
      setImageUrl(null);
      onImageUrlChange('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-gray-300 mb-2">Design Image</div>
      
      {imageUrl ? (
        <div className="relative">
          <Image 
            src={imageUrl} 
            alt="Design preview" 
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
            width={400}
            height={192}
            unoptimized={true}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div 
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 bg-gray-800/50 h-48"
        >
          {isUploading ? (
            <div className="text-center">
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
              {errorMessage ? (
                <div className="text-center text-red-500">
                  <X size={32} className="mx-auto mb-2" />
                  <p>{errorMessage}</p>
                </div>
              ) : (
                <>
                  <CloudUpload size={32} className="mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Click or drag to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (max. 5MB)</p>
                </>
              )}
            </>
          )}
        </div>
      )}
      
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