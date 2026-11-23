'use client';

import React, { Suspense } from 'react';
import { Spinner } from '@heroui/react';
import { CatalogView } from '@/components/shop/CatalogView';

export default function CatalogPage() {
  return (
    <div className="w-full pb-16">
      <Suspense
        fallback={
          <div className="text-center py-16">
            <Spinner size="lg" color="success" />
          </div>
        }
      >
        <CatalogView />
      </Suspense>
    </div>
  );
}
