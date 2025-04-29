import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';

const CollectionSection = () => {
  return (
    <section className="max-w-[1440px] mx-auto py-16 px-4">
      <h2 className="text-2xl font-bold mb-2">Trending Collection</h2>
      <p className="text-gray-400 mb-8">
        Check Out Our Weekly Updated Trending Collection.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Collection Card 1 */}
        <div className="bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800">
          <div className="aspect-[3/4] relative">
            <Image
              src="/product1.jpeg?height=400&width=300"
              alt="Fashion Item"
              width={300}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold">Urban Collection</h3>
            <p className="text-sm text-gray-400">by Deluxe Lux Sensation</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Image
                  key={i}
                  src="/product1.jpeg?height=80&width=80"
                  alt="Thumbnail"
                  width={80}
                  height={80}
                  className="w-full aspect-square object-cover rounded-md"
                />
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              See All
            </Button>
          </div>
        </div>

        {/* Collection Card 2 */}
        <div className="bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800">
          <div className="aspect-[3/4] relative">
            <Image
              src="/product2.jpeg?height=400&width=300"
              alt="Fashion Item"
              width={300}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold">Pastel Dreams</h3>
            <p className="text-sm text-gray-400">by A.I.D.A</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Image
                  key={i}
                  src="/product2.jpeg?height=80&width=80"
                  alt="Thumbnail"
                  width={80}
                  height={80}
                  className="w-full aspect-square object-cover rounded-md"
                />
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              See All
            </Button>
          </div>
        </div>

        {/* Collection Card 3 */}
        <div className="bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800">
          <div className="aspect-[3/4] relative">
            <Image
              src="/product3.jpeg?height=400&width=300"
              alt="Fashion Item"
              width={300}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold">Formal Elegance</h3>
            <p className="text-sm text-gray-400">by Vantablack</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Image
                  key={i}
                  src="/product3.jpeg?height=80&width=80"
                  alt="Thumbnail"
                  width={80}
                  height={80}
                  className="w-full aspect-square object-cover rounded-md"
                />
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              See All
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
