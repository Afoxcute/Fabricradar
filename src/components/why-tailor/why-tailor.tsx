'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';

const WhyTailor = () => {
  const features = [
    {
      title: 'Discover Unique Style',
      description:
        "Find designs you won't see in retail or traditional e-commerce. Own truly unique fashion pieces.",
      icon: 'sparkles',
    },
    {
      title: 'Empowering Creators',
      description:
        'Support designers directly, with no middlemen. Creators earn more while you pay fair prices.',
      icon: 'users',
    },
    {
      title: 'Fashion Meets Web3',
      description:
        'Enjoy ownership, authenticity, and resale benefits that only blockchain technology can provide.',
      icon: 'link',
    },
  ];

  return (
    <section className="container mx-auto py-16 relative">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <Badge
          variant="outline"
          className="mb-3 bg-cyan-950/50 text-cyan-400 border-cyan-800/50 px-3 py-1 inline-flex items-center"
        >
          <Star size={14} className="mr-1" />
          Benefits
        </Badge>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Why Fabricradar?
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 opacity-50">
                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/20 to-transparent rotate-45 transform -translate-x-full animate-shimmer"></div>
              </div>

              <Star className="w-7 h-7 text-cyan-400 relative z-10" />
            </motion.div>

            <motion.h3
              className="font-bold text-xl mb-4 text-white"
              whileHover={{ color: '#84C7DC' }}
              transition={{ duration: 0.2 }}
            >
              {feature.title}
            </motion.h3>

            <p className="text-gray-400 text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhyTailor;
