import React from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import Link from 'next/link';

const ExclusiveSection = () => {
  return (
    <section className="container mx-auto py-16">
      <h2 className="text-2xl font-bold mb-8">Exclusive Tailor-Made Designs</h2>

      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          variant="secondary"
          className="rounded-full bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          All
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-gray-700 hover:bg-gray-800"
        >
          Collectibles
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-gray-700 hover:bg-gray-800"
        >
          Music
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-gray-700 hover:bg-gray-800"
        >
          Metaverse
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-gray-700 hover:bg-gray-800"
        >
          Virtual Worlds
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* NFT Items - First Row */}
        {[
          { id: '1', name: 'Pink Midi Dress', price: '1.2 ETH', usd: '$1997' },
          {
            id: '2',
            name: 'White Kaftan With Beads',
            price: '1.5 ETH',
            usd: '$2500.12',
          },
          { id: '3', name: 'Mint Green Dress', price: '1.1 ETH', usd: '$1837' },
          {
            id: '4',
            name: 'Agbada for Men With Embroidery',
            price: '1.6 ETH',
            usd: '$2667',
          },
        ].map((item, i) => (
          <Link href={`/product/${item.id}`} key={i}>
            <div className="bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800 transition-all hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="aspect-[3/4] relative">
                <Image
                  src="/placeholder.svg?height=400&width=300"
                  alt={item.name}
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm truncate">{item.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-cyan-400 font-bold">{item.price}</p>
                    <p className="text-gray-400 text-xs">{item.usd}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* NFT Items - Second Row */}
        {[
          { name: 'Agbada Kaftan', price: '1.3 ETH', usd: '$2165.12' },
          { name: 'African Aso Oke', price: '1.5 ETH', usd: '$2500' },
          { name: 'Safari Suit', price: '1.1 ETH', usd: '$1837' },
          { name: 'Brocaded Pocket Kaftan', price: '1.8 ETH', usd: '$3000.12' },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gray-900/50 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-800"
          >
            <div className="aspect-[3/4] relative">
              <Image
                src="/placeholder.svg?height=400&width=300"
                alt={item.name}
                width={300}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm truncate">{item.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-cyan-400 font-bold">{item.price}</p>
                  <p className="text-gray-400 text-xs">{item.usd}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Button className="bg-transparent border border-gray-700 hover:bg-gray-800 text-white px-8">
          Enter Marketplace
        </Button>
      </div>
    </section>
  );
};

export default ExclusiveSection;
