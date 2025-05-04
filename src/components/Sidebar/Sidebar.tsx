'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarNavItem } from '../SidebarNavItem';
import { FaHouse } from 'react-icons/fa6';
import { CiStickyNote } from 'react-icons/ci';
import { IoChevronBackCircle } from 'react-icons/io5';
import { AiFillProduct } from 'react-icons/ai';

export const NAVIGATIONS = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <FaHouse size={24} />,
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: <CiStickyNote size={24} />,
  },
  {
    title: 'Products',
    href: '/products',
    icon: <AiFillProduct size={24} />,
  },
];

const SidebarBottom = ({
  onCollapse,
  isCollapsed,
}: {
  onCollapse: () => void;
  isCollapsed: boolean;
}) => {
  return (
    <div className="h-[50px] w-full flex-shrink-0 px-2 text-white">
      <div className="flex flex-col gap-3">
        <SidebarBottomItem
          icon={
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center"></div>
          }
          text="Help"
          isCollapsed={isCollapsed}
        />
        <SidebarBottomItem
          icon={
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <IoChevronBackCircle size={30} />
            </div>
          }
          text="Collapse"
          isCollapsed={isCollapsed}
          onClick={onCollapse} // Add onClick handler
        />
      </div>
    </div>
  );
};

interface ISidebarBottomItemProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  isCollapsed: boolean;
}

const SidebarBottomItem = ({
  icon,
  text,
  onClick,
  isCollapsed,
}: ISidebarBottomItemProps) => {
  return (
    <div
      className="flex gap-5 items-center px-4 cursor-pointer"
      onClick={onClick}
    >
      <div>{icon}</div>
      {!isCollapsed && <p>{text}</p>}
    </div>
  );
};

const Sidebar = ({
  isCollapsed,
  handleCollapse,
}: {
  isCollapsed: boolean;
  handleCollapse: () => void;
}) => {
  const pathname = usePathname();

  return (
    <div className="w-full bg-[#050b18] h-full relative flex flex-col">
      <div
        className="flex-grow overflow-y-auto pl-2 pr-[15px]"
        style={{ maxHeight: `calc(100vh - 86px - 160px)` }}
      >
        <div className="flex flex-col gap-1 pb-2 mt-3">
          {NAVIGATIONS.map((nav) => (
            <SidebarNavItem
              key={nav.title}
              nav={nav}
              pathname={pathname}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>
      <SidebarBottom onCollapse={handleCollapse} isCollapsed={isCollapsed} />
    </div>
  );
};

export default Sidebar;
