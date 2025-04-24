import { Star } from 'lucide-react';
import React from 'react';

const WhyTailor = () => {
  return (
    <section className="container mx-auto py-16">
      <h2 className="text-2xl font-bold mb-12 text-center">
        Why Tailor Module?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Star className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="font-bold mb-4">Discover Unique Style</h3>
          <p className="text-gray-400 text-sm">
            Find designs you won't see in retail or traditional e-commerce. Own
            truly unique fashion pieces.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Star className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="font-bold mb-4">Empowering Creators</h3>
          <p className="text-gray-400 text-sm">
            Support designers directly, with no middlemen. Creators earn more
            while you pay fair prices.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Star className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="font-bold mb-4">Fashion Meets Web3</h3>
          <p className="text-gray-400 text-sm">
            Enjoy ownership, authenticity, and resale benefits that only
            blockchain technology can provide.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyTailor;
