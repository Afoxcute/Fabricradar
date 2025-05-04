import Image from 'next/image';
import React from 'react';

const HeroSection = () => {
  return (
    <section>
      <div className="mt-10 grid md:grid-cols-2 grid-cols-1 gap-7 max-w-[1440px] px-4 mx-auto">
        <div className="w-full flex items-center">
          <div className="w-full flex flex-col gap-2">
            <h3 className="font-adLamDisplay md:text-[32px] text-2xl text-[#84C7DC] ">
              Powered by Web3.
            </h3>
            <h1 className="font-adLamDisplay md:text-[66px] md:leading-[80px] text-5xl leading-[45px]">
              Empowering Tailors. Elevating Fashion.
            </h1>
            <p className="text-[#D8EFF5]">
              Discover, own, and showcase exclusive tailor-made designs in a
              decentralized fashion marketplace.
            </p>
          </div>
        </div>
        <div className="w-full">
          <Image
            src="/heroImg.png"
            alt="Hero Image"
            width={500}
            height={500}
            className="w-full h-auto"
          />
        </div>
      </div>
      {/* Blockchain Partners */}
      <div className="mt-16 flex flex-wrap items-center gap-8 md:gap-16 max-w-[1440px] mx-auto justify-between px-4">
        {[
          { src: '/solanaLogo.svg', label: 'SOLANA', width: 120 },
          { src: '/superteam.svg', label: 'Superteam', width: 120 },
          { src: '/usdcLogo.png', label: 'USDC', width: 120 },
        ].map((logo, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-[120px] h-[50px] flex items-center justify-center relative">
              <Image
                src={logo.src}
                alt={logo.label}
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold">{logo.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
