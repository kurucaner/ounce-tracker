import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OunceTracker Admin',
  description: 'Admin dashboard for OunceTracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="flex h-14 items-center px-6">
              <Link href="/" className="flex items-center space-x-2">
                <Settings className="h-6 w-6" />
                <span className="font-bold">Admin</span>
              </Link>
              <nav className="flex flex-1 items-center justify-end space-x-6 text-sm font-medium">
                <Link href="/dealers" className="transition-colors hover:text-foreground/80">
                  Dealers
                </Link>
                <Link href="/products" className="transition-colors hover:text-foreground/80">
                  Products
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
