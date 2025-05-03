import React, { ReactNode } from 'react';

interface ILayout {
  children: ReactNode;
}

const Layout = ({ children }: ILayout) => {
  return <div>{children}</div>;
};

export default Layout;
