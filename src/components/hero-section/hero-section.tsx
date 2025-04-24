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
        <div className="flex items-center gap-2">
          <Image
            src="/placeholder.svg?height=24&width=24"
            alt="Solana"
            width={24}
            height={24}
          />
          <span className="font-bold">SOLANA</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/placeholder.svg?height=24&width=24"
            alt="Ethereum"
            width={24}
            height={24}
          />
          <span className="font-bold">ethereum</span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/placeholder.svg?height=24&width=24"
            alt="Blockchain.io"
            width={24}
            height={24}
          />
          <span className="font-bold">blockchain.io</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
