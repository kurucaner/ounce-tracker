'use client';

import { ShoppingBag } from 'lucide-react';
import { memo } from 'react';

export const FloatingStoreCta = memo(() => {
  return (
    <a
      href="https://shop.ouncetracker.com"
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 sm:bottom-8 sm:right-8"
      aria-label="Visit our Shopify store"
      title="Visit our store"
    >
      <ShoppingBag className="h-5 w-5 text-primary-foreground transition-transform duration-200 group-hover:scale-110" />
    </a>
  );
});
FloatingStoreCta.displayName = 'FloatingStoreCta';

