import { Badge } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';

const CtaBanner = () => {
  return (
    <section className="container mx-auto py-16">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="relative w-48 h-48 bg-cyan-900/30 rounded-full flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                }}
              >
                <div
                  className="absolute -translate-y-20"
                  style={{
                    transform: `translateY(-5rem)`,
                  }}
                >
                  <Image
                    src="/placeholder.svg?height=24&width=24"
                    alt="Fashion icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <Badge className="mb-2 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 border-none">
            For Tailors
          </Badge>
          <h2 className="text-2xl font-bold mb-2">
            Join The New Era Of Fashion
          </h2>
          <p className="text-gray-400 mb-6">
            Upload Your Designs, Sell Your Pieces, And Get Paid With Every Sale.
            No More Middlemen.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Register Now
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
