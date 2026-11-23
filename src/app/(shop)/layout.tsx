import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Providers } from '../providers';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="relative min-h-screen flex flex-col gh-cyber-bg text-[#e2e2e6]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </Providers>
  );
}
