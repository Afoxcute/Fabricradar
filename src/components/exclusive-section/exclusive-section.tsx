'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { Clock, DollarSign, Loader2, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/badge';

type Category = 'all' | 'formal' | 'casual' | 'traditional' | 'modern';

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

const ExclusiveSection = () => {
  const [category, setCategory] = useState<Category>('all');
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch designs from the API
  const {
    data: designsData,
    isLoading,
    error,
  } = api.designs.getAllDesigns.useQuery({ limit: 4 });

  const handleCategoryChange = (newCategory: Category) => {
    if (newCategory === category) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCategory(newCategory);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <section className="container mx-auto py-16 relative">
      {/* Background elements */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <Badge
          variant="outline"
          className="mb-3 bg-cyan-950/50 text-cyan-400 border-cyan-800/50 px-3 py-1"
        >
          <Sparkles size={14} className="mr-1" />
          Exclusive Designs
        </Badge>
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Exclusive Tailor-Made Designs
        </h2>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-3 mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
      >
        {[
          { value: 'all', label: 'All' },
          { value: 'formal', label: 'Formal' },
          { value: 'casual', label: 'Casual' },
          { value: 'traditional', label: 'Traditional' },
          { value: 'modern', label: 'Modern' },
        ].map((item) => (
          <Button
            key={item.value}
            variant={
              category === (item.value as Category) ? 'secondary' : 'outline'
            }
            className={
              category === (item.value as Category)
                ? 'rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-none'
                : 'rounded-full border-gray-700 hover:bg-gray-800 hover:text-cyan-300 transition-all duration-300'
            }
            onClick={() => handleCategoryChange(item.value as Category)}
          >
            {item.label}
          </Button>
        ))}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {designsData?.designs.map((design: any, index: number) => {
              // Get tailor name
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
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
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

                    {/* New tag for first item */}
                    {index === 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20 flex items-center">
                        <Star size={12} className="mr-1" fill="white" />
                        NEW
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg group-hover:text-cyan-300 transition-colors">
                      {design.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      by {tailorName}
                    </p>

                    <div className="flex justify-between items-center">
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
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
};

export default ExclusiveSection;
