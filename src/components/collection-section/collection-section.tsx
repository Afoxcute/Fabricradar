'use client';

import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';
import { api } from '@/trpc/react';
import { Clock, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  images?: string[] | null;
  averageTimeline: string;
  tailorId: number;
  tailor?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
}

const CollectionSection = () => {
  // Fetch designs from the API
  const { data: designsData, isLoading, error } = api.designs.getAllDesigns.useQuery({ limit: 3 });
  
  return (
    <section className="max-w-[1440px] mx-auto py-16 px-4">
      <h2 className="text-2xl font-bold mb-2">Trending Collection</h2>
      <p className="text-gray-400 mb-8">
        Check Out Our Weekly Updated Trending Collection.
      </p>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={24} className="animate-spin text-cyan-500" />
          <span className="ml-2 text-gray-400">Loading designs...</span>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg my-8">
          <p>Failed to load designs. Please try again later.</p>
        </div>
      ) : designsData?.designs.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
          <p className="text-gray-400">No designs available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {designsData?.designs.map((design) => {
            // Get tailor name if available from API data, otherwise use fallback
            const tailorName = design.tailor
              ? `${design.tailor.firstName || ''} ${design.tailor.lastName || ''}`.trim() || 'Anonymous Tailor'
              : 'Anonymous Tailor';
            
            // Get image URL (from API or fallback) - ensure it's always a string
            let imageUrl: string = '/product1.jpeg';
            if (design.images && Array.isArray(design.images) && design.images.length > 0) {
              imageUrl = design.images[0] as string;
            } else if (design.imageUrl) {
              imageUrl = design.imageUrl;
            }
              
            return (
              <div key={design.id} className="bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 transition-transform hover:scale-[1.02]">
          <div className="aspect-[3/4] relative">
            <Image
                    src={imageUrl}
                    alt={design.title}
                    width={400}
                    height={533}
              className="w-full h-full object-cover"
                    unoptimized={imageUrl.startsWith('http')}
            />
          </div>
          <div className="p-4">
                  <h3 className="font-bold">{design.title}</h3>
                  <p className="text-sm text-gray-400">by {tailorName}</p>
                  
                  <p className="mt-3 text-sm text-gray-300 line-clamp-2">{design.description}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-cyan-500">
                      <DollarSign size={16} className="mr-1" />
                      <span className="font-semibold">${design.price.toFixed(2)}</span>
            </div>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock size={16} className="mr-1" />
                      <span>{design.averageTimeline}</span>
          </div>
        </div>

                  <Link href={`/product/${design.id}`}>
            <Button
              variant="outline"
              className="w-full mt-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
                      View Details
            </Button>
                  </Link>
                </div>
          </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CollectionSection;
