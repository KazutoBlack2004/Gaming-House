import type { Metadata } from 'next';
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SITE_CONFIG } from '@/lib/constants';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-outfit',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} — Tu setup listo para ganar`,
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
    <html
      lang="es"
      className={`dark ${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-[#111317] text-[#e2e2e6] font-sans min-h-screen selection:bg-[#00ff88] selection:text-[#003919]">
        {children}
      </body>
    </html>
  );
}
