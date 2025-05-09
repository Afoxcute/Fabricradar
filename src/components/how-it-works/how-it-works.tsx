'use client';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Info } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      title: 'Discover Unique Styles',
      description:
        'Browse through our curated collection of unique fashion designs from around the world.',
    },
    {
      step: 2,
      title: 'Buy or Mint',
      description:
        'Purchase existing designs or mint your own custom fashion NFTs.',
    },
    {
      step: 3,
      title: 'Connect with Tailors',
      description:
        'Communicate directly with designers to customize your perfect fashion piece.',
    },
    {
      step: 4,
      title: 'Flaunt & Trade',
      description:
        'Show off your unique fashion pieces and trade them in our marketplace.',
    },
  ];

  return (
    <section className="container mx-auto py-16 relative">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12 relative z-10"
      >
        <Badge
          variant="outline"
          className="mb-3 bg-cyan-950/50 text-cyan-400 border-cyan-800/50 px-3 py-1 inline-flex items-center"
        >
          <Info size={14} className="mr-1" />
          Process
        </Badge>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          How It Works
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Find Out How To Get Started
        </p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        {/* Animated vertical line */}
        <motion.div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/30 via-cyan-400/50 to-cyan-500/30 -translate-x-1/2"
          initial={{ height: 0 }}
          whileInView={{ height: '100%' }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        ></motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8 relative z-10">
          {steps.map((item, idx) => {
            const isEven = idx % 2 === 0;
            const isLeft =
              (idx % 2 === 0 && idx < 2) || (idx % 2 !== 0 && idx >= 2);

            return (
              <motion.div
                key={idx}
                className={`relative ${isLeft ? 'md:text-right md:col-start-1' : 'md:col-start-2'} ${idx >= 2 ? 'md:row-start-2' : 'md:row-start-1'}`}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Animated dot */}
                <motion.div
                  className="absolute left-1/2 top-0 w-6 h-6 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1 + idx * 0.1,
                  }}
                  viewport={{ once: true }}
                >
                  <span className="text-xs font-bold">{item.step}</span>
                </motion.div>

                {/* Pulse effect */}
                <motion.div
                  className="absolute left-1/2 top-0 w-6 h-6 bg-cyan-500/50 rounded-full -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0, opacity: 1 }}
                  whileInView={{ scale: 2.5, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: idx * 0.2,
                  }}
                  viewport={{ once: true }}
                ></motion.div>

                <motion.div
                  className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 hover:border-cyan-800/50 p-6 rounded-lg transition-all duration-300"
                  whileHover={{
                    y: -5,
                    boxShadow: '0 10px 25px -5px rgba(0, 201, 255, 0.1)',
                    borderColor: 'rgba(0, 201, 255, 0.3)',
                  }}
                >
                  <h3 className="text-lg font-bold mb-2">Step {item.step}</h3>
                  <h4 className="text-cyan-400 font-medium mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
