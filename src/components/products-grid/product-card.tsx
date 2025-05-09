'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Star } from 'lucide-react';

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
  images?: JsonValue | null;
  averageTimeline: string;
  tailorId: number;
  tailor?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
}

interface ProductCardProps {
  design: Design;
  index: number;
  featured?: boolean;
}

const ProductCard = ({ design, index, featured = false }: ProductCardProps) => {
  // Get tailor name
  const tailorName = design.tailor
    ? `${design.tailor.firstName || ''} ${design.tailor.lastName || ''}`.trim() ||
      'Anonymous Tailor'
    : 'Anonymous Tailor';

  // Get image URL (from API or fallback)
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
      className="group bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 hover:border-cyan-800/70 transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
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

        {/* Featured tag */}
        {featured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md z-20 flex items-center">
            <Star size={12} className="mr-1" fill="white" />
            FEATURED
          </div>
        )}

        {/* Quick view button that appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          {/* <Button
            variant="secondary"
            className="bg-gray-900/80 hover:bg-gray-900 text-white border border-cyan-500"
            size="sm"
          >
            Quick View
          </Button> */}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg group-hover:text-cyan-300 transition-colors">
          {design.title}
        </h3>
        <p className="text-sm text-gray-400 mb-3">by {tailorName}</p>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-cyan-400">
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
            className="w-full mt-4 border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-500 transition-all duration-300"
          >
            View Details
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
