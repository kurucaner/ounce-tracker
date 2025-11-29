'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaHome } from 'react-icons/fa';

export const SiteHeader = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    const active = isActive(path);
    return `relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
      active
        ? 'text-primary bg-accent/50 font-semibold'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link
          href="/"
          className="flex items-center space-x-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          {/* <Coins className="h-6 w-6" /> */}
          <Image src="/logo.png" alt="OunceTracker" width={24} height={24} />
          <span className="font-bold">OunceTracker</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end gap-2">
          <Link href="/" className={navLinkClass('/')}>
            <FaHome className="h-4 w-4 shrink-0" />
            <span>Home</span>
            {isActive('/') && (
              <span className="absolute -bottom-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </Link>
          <Link href="/insights" className={navLinkClass('/insights')}>
            {/* <FaLightbulb className="h-4 w-4" /> */}
            <span>Insights</span>
            {isActive('/insights') && (
              <span className="absolute -bottom-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};
SiteHeader.displayName = 'SiteHeader';
