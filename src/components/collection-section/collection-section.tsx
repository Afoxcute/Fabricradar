'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import { api } from '@/trpc/react';
import { Clock, DollarSign, Loader2, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';

// Import JsonValue type or define it
type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

interface Design {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  images?: JsonValue | null; // Updated to handle JsonValue from API
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
  const {
    data: designsData,
    isLoading,
    error,
  } = api.designs.getAllDesigns.useQuery({ limit: 3 });

  return (
    <section className="max-w-[1440px] mx-auto py-16 px-4 relative">
      {/* Background elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <Badge
              variant="outline"
              className="mb-3 bg-cyan-950/50 text-cyan-400 border-cyan-800/50 px-3 py-1"
            >
              <Sparkles size={14} className="mr-1" />
              Trending Now
            </Badge>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Trending Collection
            </h2>
            <p className="text-gray-400">
              Check Out Our Weekly Updated Trending Collection.
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-4 md:mt-0 border-cyan-700 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300"
          >
            View All Collections
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 bg-gray-900/30 rounded-xl backdrop-blur-sm border border-gray-800/50">
          <Loader2 size={24} className="animate-spin text-cyan-500 mr-2" />
          <span className="text-gray-400">Loading designs...</span>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg my-8">
          <p>Failed to load designs. Please try again later.</p>
        </div>
      ) : designsData?.designs.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
          <p className="text-gray-400">
            No designs available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {designsData?.designs.map((design: any, index: number) => {
            // Get tailor name if available from API data, otherwise use fallback
            const tailorName = design.tailor
              ? `${design.tailor.firstName || ''} ${design.tailor.lastName || ''}`.trim() ||
                'Anonymous Tailor'
              : 'Anonymous Tailor';

            // Get image URL (from API or fallback) - ensure it's always a string
            let imageUrl = '/product1.jpeg';
            if (
              design.images &&
              Array.isArray(design.images) &&
              design.images.length > 0
            ) {
              imageUrl = design.images[0] as string;
            } else if (design.imageUrl) {
              imageUrl = design.imageUrl;
            }

            return (
              <motion.div
                key={design.id}
                className="group bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 hover:border-cyan-800/70 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  boxShadow: '0 15px 30px -10px rgba(0, 201, 255, 0.15)',
                }}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

                  <Image
                    src={imageUrl || '/placeholder.svg'}
                    alt={design.title}
                    width={400}
                    height={533}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized={imageUrl.startsWith('http')}
                  />

                  {/* Hot tag for first item */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20 flex items-center">
                      <Star size={12} className="mr-1" fill="white" />
                      HOT
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg group-hover:text-cyan-300 transition-colors">
                    {design.title}
                  </h3>
                  <p className="text-sm text-gray-400">by {tailorName}</p>

                  <p className="mt-3 text-sm text-gray-300 line-clamp-2">
                    {design.description}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-cyan-400">
                      <DollarSign size={16} className="mr-1" />
                      <span className="font-semibold">
                        ${design.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock size={16} className="mr-1" />
                      <span>{design.averageTimeline}</span>
                    </div>
                  </div>

                  <Link href={`/product/${design.id}`}>
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-500 transition-all duration-300"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CollectionSection;
