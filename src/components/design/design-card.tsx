'use client';

import React from 'react';
import { Clock, DollarSign, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface DesignCardProps {
  design: {
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
  };
  showActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function DesignCard({ 
  design,
  showActions = false,
  onEdit,
  onDelete
}: DesignCardProps) {
  // Get tailor name
  const tailorName = design.tailor
    ? `${design.tailor.firstName || ''} ${design.tailor.lastName || ''}`.trim() || 'Anonymous Tailor'
    : 'Anonymous Tailor';
  
  // Truncate description for card view
  const truncatedDescription = design.description.length > 120
    ? `${design.description.substring(0, 120)}...`
    : design.description;
  
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Image */}
      <div className="h-48 relative bg-gray-800">
        {design.imageUrl ? (
          <Image
            src={design.imageUrl}
            alt={design.title}
            width={400}
            height={200}
            className="w-full h-full object-cover"
            unoptimized={design.imageUrl.startsWith('http')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 truncate">{design.title}</h3>
        
        <p className="text-gray-400 text-sm mb-4">{truncatedDescription}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-cyan-500">
            <DollarSign size={16} className="mr-1" />
            <span className="font-semibold">${design.price.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <Clock size={16} className="mr-1" />
            <span>{design.averageTimeline}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-400 text-sm">
          <User size={16} className="mr-1" />
          <span>By {tailorName}</span>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(design.id)}
                className="flex-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-500 font-medium py-1.5 px-3 rounded-lg text-sm"
              >
                Edit
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(design.id)}
                className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-500 font-medium py-1.5 px-3 rounded-lg text-sm"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 