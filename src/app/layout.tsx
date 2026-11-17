import type { Metadata } from 'next';
import './globals.css';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-white text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
