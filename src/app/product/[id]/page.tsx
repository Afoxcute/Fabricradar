'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  ChevronRight,
  Download,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatInterface } from '@/components/chat-interface/chat-interface';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { useState, useEffect } from 'react';
import OrderModal from '@/components/order-modal/order-modal';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import toast from 'react-hot-toast';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { user } = useAuth();
  
  // Fetch design data based on the ID
  const { data: designData, isLoading, error } = api.designs.getDesignById.useQuery({
    designId: parseInt(params.id)
  }, {
    enabled: Boolean(params.id) && /^\d+$/.test(params.id),
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  // Handle the case where we're fetching a design that doesn't exist
  if (error) {
    console.error('Error loading design:', error);
  }

  // If we have a valid design, use it, otherwise use fallback data
  const design = designData?.design;

  // Handle start order click
  const handleStartOrder = () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }
    
    if (!user.walletAddress) {
      toast.error('Please connect your wallet to place an order');
      return;
    }
    
    setShowOrderModal(true);
  };

  // Fallback if design isn't loaded yet
  const product = design ? {
    id: design.id,
    name: design.title,
    price: design.price,
    eth: design.price,
    priceChange: '+1.6%',
    description: design.description,
    images: [
      design.imageUrl || '/product3.jpeg?height=600&width=450',
      '/product3.jpeg?height=150&width=100',
      '/product3.jpeg?height=150&width=100',
      '/product3.jpeg?height=150&width=100',
    ],
    creator: {
      name: design.tailor ? `${design.tailor.firstName || ''} ${design.tailor.lastName || ''}`.trim() || 'Anonymous Designer' : 'Anonymous Designer',
      avatar: '/placeholder.svg?height=40&width=40',
      rating: 4.8,
      reviews: 23,
      projectsCompleted: 32,
      uniqueDesigns: 60,
    },
    reviews: [
      {
        text: '"The tailor brought my dream outfit to life! The attention to detail was extraordinary, an NFT, but wearing it in real life was a whole new level. The stitching, fit, and fabric were perfect. So glad I found this on Tailor Module!"',
        author: '@mark_glow',
        avatar: '/placeholder.svg?height=30&width=30',
      },
      {
        text: '"Absolutely blown away by the quality and craftsmanship of this piece. The design was unique, and the finished outfit got me compliments all night at a wedding. 10/10, would recommend!"',
        author: '@fashiontrends',
        avatar: '/placeholder.svg?height=30&width=30',
      },
      {
        text: '"What I love about this design is the attention to detail. The piece I bought was elegant and classic—and the tailoring was flawless. They\'re truly setting the bar for fashion in Web3!"',
        author: '@mia_love',
        avatar: '/placeholder.svg?height=30&width=30',
      },
    ],
  } : {
    id: params.id,
    name: 'Loading Design...',
    price: 0,
    eth: 0,
    priceChange: '+0.0%',
    description: 'Loading design details...',
    images: [
      '/placeholder.svg?height=600&width=450',
      '/placeholder.svg?height=150&width=100',
      '/placeholder.svg?height=150&width=100',
      '/placeholder.svg?height=150&width=100',
    ],
    creator: {
      name: 'Unknown Designer',
      avatar: '/placeholder.svg?height=40&width=40',
      rating: 0,
      reviews: 0,
      projectsCompleted: 0,
      uniqueDesigns: 0,
    },
    reviews: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden">
      {/* Order Modal */}
      {design && (
        <OrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          productName={product.name}
          designId={design.id}
          tailorId={design.tailorId}
          price={design.price}
          designDescription={design.description}
        />
      )}

      {/* Stars/particles background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 border border-cyan-400/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <Header />

      {/* Back button and creator info */}
      <div className="container mx-auto mt-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={product.creator.avatar || '/placeholder.svg'}
                alt={product.creator.name}
                width={40}
                height={40}
                className="rounded-full border-2 border-cyan-500"
              />
            </div>
            <div>
              <p className="text-sm text-gray-400">Designer</p>
              <p className="font-medium">{product.creator.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-8 ml-0 md:ml-auto">
            <div>
              <p className="text-sm text-gray-400">Average rating</p>
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{product.creator.rating}</span>
                <span className="text-gray-400 text-sm ml-1">
                  ({product.creator.reviews} Clients)
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Projects completed</p>
              <p className="font-medium">{product.creator.projectsCompleted}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Unique designs</p>
              <p className="font-medium">{product.creator.uniqueDesigns}</p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mt-4">{product.name}</h1>
      </div>

      {/* Product Display */}
      <div className="container mx-auto mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="flex gap-4">
            <div className="hidden md:flex flex-col gap-4">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="w-20 h-20 border border-gray-700 rounded-md overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors"
                >
                  <Image
                    src={image || '/placeholder.svg'}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                    unoptimized={image.startsWith('http')}
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 rounded-lg overflow-hidden border border-gray-800">
              <Image
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                width={600}
                height={800}
                className="w-full h-full object-cover"
                unoptimized={product.images[0].startsWith('http')}
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h2 className="text-3xl font-bold mb-2">{product.name}</h2>

            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-3xl font-bold text-cyan-400">
                ${product.price}
              </span>
              <span className="text-green-500 text-sm">
                {product.priceChange}
              </span>
              <div className="ml-auto">
                <span className="text-xl font-bold">{product.eth} USDC</span>
                <p className="text-gray-400 text-sm">Price</p>
              </div>
            </div>

            <p className="text-gray-300 mb-8">{product.description}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                className="bg-cyan-500 hover:bg-cyan-600 text-white flex items-center gap-2"
                onClick={handleStartOrder}
                disabled={isLoading || !design}
              >
                <span>Start order</span>
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 flex items-center gap-2"
              >
                <span>Chat with tailor</span>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="container mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6">Description</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-gray-900/30 rounded-lg overflow-hidden"
            >
              <Image
                src="/placeholder.svg?height=150&width=150"
                alt="Product detail"
                width={150}
                height={150}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                <p className="text-sm text-gray-400">
                  Checkout Our Weekly Updated Trending Collection.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Reviews */}
      <div className="container mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6">Client&apos;s Reviews</h2>

        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-8 relative">
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {product.reviews.map((review, index) => (
              <div key={index} className="min-w-[300px] max-w-md flex flex-col">
                <p className="text-gray-300 mb-4">{review.text}</p>
                <div className="mt-auto flex items-center gap-2">
                  <Image
                    src={review.avatar || '/placeholder.svg'}
                    alt={review.author}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <span className="text-gray-400">{review.author}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container mx-auto mt-16 mb-16">
        <ChatInterface
          productName={product.name}
          designerName={product.creator.name}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
