'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { Clock, DollarSign, Loader2 } from 'lucide-react';

type Category = 'all' | 'formal' | 'casual' | 'traditional' | 'modern';

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

const ExclusiveSection = () => {
  const [category, setCategory] = useState<Category>('all');
  
  // Fetch designs from the API
  const { data: designsData, isLoading, error } = api.designs.getAllDesigns.useQuery({ limit: 4 });

  return (
    <section className="container mx-auto py-16">
      <h2 className="text-2xl font-bold mb-8">Exclusive Tailor-Made Designs</h2>

      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          variant={category === 'all' ? 'secondary' : 'outline'}
          className={category === 'all' ? 
            "rounded-full bg-cyan-500 hover:bg-cyan-600 text-white" : 
            "rounded-full border-gray-700 hover:bg-gray-800"}
          onClick={() => setCategory('all')}
        >
          All
        </Button>
        <Button
          variant={category === 'formal' ? 'secondary' : 'outline'}
          className={category === 'formal' ? 
            "rounded-full bg-cyan-500 hover:bg-cyan-600 text-white" : 
            "rounded-full border-gray-700 hover:bg-gray-800"}
          onClick={() => setCategory('formal')}
        >
          Formal
        </Button>
        <Button
          variant={category === 'casual' ? 'secondary' : 'outline'}
          className={category === 'casual' ? 
            "rounded-full bg-cyan-500 hover:bg-cyan-600 text-white" : 
            "rounded-full border-gray-700 hover:bg-gray-800"}
          onClick={() => setCategory('casual')}
        >
          Casual
        </Button>
        <Button
          variant={category === 'traditional' ? 'secondary' : 'outline'}
          className={category === 'traditional' ? 
            "rounded-full bg-cyan-500 hover:bg-cyan-600 text-white" : 
            "rounded-full border-gray-700 hover:bg-gray-800"}
          onClick={() => setCategory('traditional')}
        >
          Traditional
        </Button>
        <Button
          variant={category === 'modern' ? 'secondary' : 'outline'}
          className={category === 'modern' ? 
            "rounded-full bg-cyan-500 hover:bg-cyan-600 text-white" : 
            "rounded-full border-gray-700 hover:bg-gray-800"}
          onClick={() => setCategory('modern')}
        >
          Modern
        </Button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designsData?.designs.map((design) => {
            // Get tailor name
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
                  <p className="text-sm text-gray-400 mb-3">by {tailorName}</p>
                  
                  <div className="flex justify-between items-center">
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

export default ExclusiveSection;
