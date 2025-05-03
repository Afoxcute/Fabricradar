'use client';
import { Sidebar } from '@/components/Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import React, { ReactNode, useState, useEffect } from 'react';

interface ILayout {
  children: ReactNode;
}

const Layout = ({ children }: ILayout) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div className="h-screen overflow-y-hidden">
      {/* <Navbar /> */}
      <div className="w-full h-[65px] bg-[#050b18] border-b px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/placeholder.svg"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-bold text-lg">Tailor Module</span>
        </Link>
      </div>
      <div
        className={`grid ${
          isCollapsed ? 'grid-cols-[80px,1fr]' : 'grid-cols-[260px,1fr]'
        } w-full`}
        style={{ height: 'calc(100vh - 65px)' }}
      >
        <Sidebar isCollapsed={isCollapsed} handleCollapse={handleCollapse} />
        <div className="w-full h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
