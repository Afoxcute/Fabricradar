'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import ProductCard from './product-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Category = 'all' | 'formal' | 'casual' | 'traditional' | 'modern';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

const ITEMS_PER_PAGE = 8;

const ProductsGrid = () => {
  const [category, setCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  // Fetch designs from the API
  // In a real implementation, you would pass the pagination parameters to the API
  const {
    data: designsData,
    isLoading,
    error,
  } = api.designs.getAllDesigns.useQuery({ limit: 20 });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, sortBy, searchQuery]);

  // Filter and sort the designs based on user selections
  const filteredDesigns = designsData?.designs
    ? designsData.designs
        .filter((design: any) => {
          // Filter by category
          if (category !== 'all') {
            // This is a placeholder. In a real app, you'd have a category field to filter on
            return true;
          }
          return true;
        })
        .filter((design: any) => {
          // Filter by search query
          if (!searchQuery) return true;
          return (
            design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (design.description &&
              design.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
          );
        })
        .sort((a: any, b: any) => {
          // Sort based on selected option
          switch (sortBy) {
            case 'price-low':
              return a.price - b.price;
            case 'price-high':
              return b.price - a.price;
            case 'popular':
              // Placeholder for popularity sorting
              return 0;
            case 'newest':
            default:
              // Placeholder for date sorting
              return 0;
          }
        })
    : [];

  // Calculate pagination
  const totalItems = filteredDesigns?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDesigns =
    filteredDesigns?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show a subset of pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto px-4 relative">
      {/* Background elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8"
      >
        <Badge
          variant="outline"
          className="mb-3 bg-cyan-950/50 text-cyan-400 border-cyan-800/50 px-3 py-1"
        >
          <Sparkles size={14} className="mr-1" />
          Browse Designs
        </Badge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              All Tailor-Made Designs
            </h1>
            <p className="text-gray-400">
              {totalItems} unique fashion{' '}
              {totalItems === 1 ? 'design' : 'designs'} available
            </p>
          </div>

          <Button
            variant="outline"
            className="md:hidden border-cyan-700 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          >
            <Filter size={16} className="mr-2" />
            {isFiltersVisible ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Filters sidebar - always visible on desktop, toggleable on mobile */}
        <motion.div
          className={`lg:block ${isFiltersVisible ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-800 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Filters</h2>

            {/* Search */}
            <div className="mb-6">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Search
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Categories
              </h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Designs' },
                  { value: 'formal', label: 'Formal Wear' },
                  { value: 'casual', label: 'Casual Wear' },
                  { value: 'traditional', label: 'Traditional' },
                  { value: 'modern', label: 'Modern' },
                ].map((item) => (
                  <Button
                    key={item.value}
                    variant="ghost"
                    className={`w-full justify-start px-2 ${
                      category === item.value
                        ? 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/40'
                        : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50'
                    }`}
                    onClick={() => setCategory(item.value as Category)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Sort By
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800"
                >
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-800 text-red-500 px-4 py-3 rounded-lg my-8">
              <p>Failed to load designs. Please try again later.</p>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800">
              <p className="text-gray-400">
                No designs match your filters. Try adjusting your search
                criteria.
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${category}-${sortBy}-${currentPage}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {paginatedDesigns.map((design: any, index: number) => (
                    <ProductCard
                      key={design.id}
                      design={design}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-800"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((pageNum, idx) => {
                      if (pageNum === 'ellipsis') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <Button
                          key={`page-${pageNum}`}
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
                          className={
                            currentPage === pageNum
                              ? 'bg-cyan-600 hover:bg-cyan-700 border-none'
                              : 'border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-800'
                          }
                          onClick={() => setCurrentPage(pageNum as number)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-800"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsGrid;
