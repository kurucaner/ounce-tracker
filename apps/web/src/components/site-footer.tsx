'use client';

import Link from 'next/link';
import { FaXTwitter } from 'react-icons/fa6';
import { ThemeToggler } from '@/components/theme-toggler';

export const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4 md:col-span-2">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">OunceTracker</h3>
              <p className="text-sm text-muted-foreground">
                Compare precious metal prices across multiple trusted bullion dealers. Find the best
                prices on gold bars, silver coins, and more.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/ouncetracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Follow us on X (Twitter)"
              >
                <FaXTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Navigation</h4>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link
                href="/"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/insights"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Insights
              </Link>
            </nav>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms & Conditions
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {currentYear} OunceTracker. All rights reserved.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Theme:</span>
                <ThemeToggler />
              </div>
              <p className="text-center text-xs text-muted-foreground sm:text-right">
                Real-time price comparison updated every minute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
SiteFooter.displayName = 'SiteFooter';
