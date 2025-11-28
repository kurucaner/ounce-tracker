import Link from 'next/link';
import Image from 'next/image';
import { FaLightbulb } from 'react-icons/fa';

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
        <Link href="/" className="flex items-center space-x-2">
          {/* <Coins className="h-6 w-6" /> */}
          <Image src="/logo.png" alt="OunceTracker" width={24} height={24} />
          <span className="font-bold">OunceTracker</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end space-x-6 text-sm font-medium">
          <Link
            href="/insights"
            className="flex items-center gap-2 transition-colors text-foreground/90 hover:text-foreground"
          >
            <FaLightbulb className="h-4 w-4" />
            Insights
          </Link>
        </nav>
      </div>
    </header>
  );
};
SiteHeader.displayName = 'SiteHeader';
