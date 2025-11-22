import Link from 'next/link';
import { Coins } from 'lucide-react';

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Coins className="h-6 w-6" />
          <span className="font-bold">OunceTracker</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end space-x-6 text-sm font-medium">
          <Link
            href="/pamp/lady-fortuna"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            Prices
          </Link>
          <Link
            href="/blog"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
};
SiteHeader.displayName = 'SiteHeader';
