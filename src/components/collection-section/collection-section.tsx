'use client';

import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';
import { api } from '@/trpc/react';
import { Clock, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Define a type for fallback designs
interface FallbackDesign {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  creator: string;
  averageTimeline: string;
}

const CollectionSection = () => {
  // Fetch designs from the API
  const { data: designsData, isLoading, error } = api.designs.getAllDesigns.useQuery({ limit: 3 });
  
  // Fallback designs for error or loading state
  const fallbackDesigns: FallbackDesign[] = [
    {
      id: 1,
      title: 'Urban Collection',
      description: 'Modern urban wear with a twist of elegance',
      price: 299.99,
      imageUrl: '/product1.jpeg',
      creator: 'Deluxe Lux Sensation',
      averageTimeline: '2-3 weeks',
    },
    {
      id: 2,
      title: 'Pastel Dreams',
      description: 'Soft pastel colors for a dreamy look',
      price: 199.99,
      imageUrl: '/product2.jpeg',
      creator: 'A.I.D.A',
      averageTimeline: '1-2 weeks',
    },
    {
      id: 3,
      title: 'Formal Elegance',
      description: 'Sophisticated formal wear for special occasions',
      price: 399.99,
      imageUrl: '/product3.jpeg',
      creator: 'Vantablack',
      averageTimeline: '3-4 weeks',
    },
  ];
  
  // Determine which designs to display
  const designsToDisplay = designsData?.designs && designsData.designs.length > 0
    ? designsData.designs
    : fallbackDesigns;

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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {designsToDisplay.map((design, index) => {
            // Get tailor name if available from API data, otherwise use fallback
            const tailorName = 'tailor' in design && design.tailor
              ? `${design.tailor.firstName || ''} ${design.tailor.lastName || ''}`.trim() || 'Anonymous Tailor'
              : ('creator' in design ? design.creator : 'Anonymous Tailor');
            
            // Get image URL (from API or fallback)
            const imageUrl = design.imageUrl || fallbackDesigns[index % fallbackDesigns.length].imageUrl;
              
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
