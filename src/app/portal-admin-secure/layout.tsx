import React from 'react';
import type { Metadata } from 'next';
import { Providers } from '../providers';

export const metadata: Metadata = {
  title: 'Panel de Administración',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
