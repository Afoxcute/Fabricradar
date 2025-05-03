// import DashboardFeature from '@/components/dashboard/dashboard-feature'

import BackgroundEffect from '@/components/background-effect/background-effect';
import CollectionSection from '@/components/collection-section/collection-section';
import CtaBanner from '@/components/cta-banner/cta-banner';
import ExclusiveSection from '@/components/exclusive-section/exclusive-section';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import HeroSection from '@/components/hero-section/hero-section';
import HowItWorks from '@/components/how-it-works/how-it-works';
import { Button } from '@/components/ui/button';
import WhyTailor from '@/components/why-tailor/why-tailor';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <Header />
      <HeroSection />
      <CollectionSection />
      <HowItWorks />
      <ExclusiveSection />
      <WhyTailor />
      <CtaBanner />
      <Footer />
    </div>
  );
}
