import React from 'react';

const HowItWorks = () => {
  return (
    <section className="container mx-auto py-16">
      <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
      <p className="text-center text-gray-400 mb-12">
        Find Out How To Get Started
      </p>

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-500/30 -translate-x-1/2"></div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8">
          {/* Step 1 */}
          <div className="relative md:text-right">
            <div className="absolute left-1/2 top-0 w-4 h-4 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Step 1</h3>
              <h4 className="text-cyan-400 font-medium mb-2">
                Discover Unique Styles
              </h4>
              <p className="text-gray-400 text-sm">
                Browse through our curated collection of unique fashion designs
                from around the world.
              </p>
            </div>
          </div>

          <div className="md:col-start-1 md:row-start-2 relative md:text-right">
            <div className="absolute left-1/2 top-0 w-4 h-4 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Step 3</h3>
              <h4 className="text-cyan-400 font-medium mb-2">
                Connect with Tailors
              </h4>
              <p className="text-gray-400 text-sm">
                Communicate directly with designers to customize your perfect
                fashion piece.
              </p>
            </div>
          </div>

          <div className="md:col-start-2 md:row-start-1 relative">
            <div className="absolute left-1/2 top-0 w-4 h-4 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Step 2</h3>
              <h4 className="text-cyan-400 font-medium mb-2">Buy or Mint</h4>
              <p className="text-gray-400 text-sm">
                Purchase existing designs or mint your own custom fashion NFTs.
              </p>
            </div>
          </div>

          <div className="md:col-start-2 md:row-start-2 relative">
            <div className="absolute left-1/2 top-0 w-4 h-4 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Step 4</h3>
              <h4 className="text-cyan-400 font-medium mb-2">Flaunt & Trade</h4>
              <p className="text-gray-400 text-sm">
                Show off your unique fashion pieces and trade them in our
                marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
