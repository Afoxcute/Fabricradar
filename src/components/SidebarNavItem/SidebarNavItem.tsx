import React from 'react';

interface SidebarNavItemProps {
  nav: {
    title: string;
    href: string;
    icon: React.ReactNode;
  };
  pathname: string;
  isCollapsed?: boolean; // Add isCollapsed prop
}

const SidebarNavItem = ({
  nav,
  pathname,
  isCollapsed,
}: SidebarNavItemProps) => {
  const isActive =
    pathname === nav.href || (nav.href === '/' && pathname === '/dashboard');

  return (
    <a
      href={nav.href}
      className={`flex items-center gap-4 text-white p-4 rounded-[6px] hover:bg-secondary cursor-pointer ${
        isActive ? 'bg-secondary' : ''
      } ${isCollapsed ? 'justify-center' : ''}`} // Add conditional justify-center
    >
      <div className={`w-6 h-6 ${isActive ? 'text-[#00BFFF]' : ''}`}>
        {nav.icon}
      </div>
      {!isCollapsed && (
        <span className={`${isActive ? 'font-bold text-[#00BFFF]' : ''}`}>
          {nav.title}
        </span>
      )}
    </a>
  );
};

export default SidebarNavItem;
