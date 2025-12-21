import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { QueryProvider } from '@/components/query-provider';
import { DatadogRumProvider } from '@/components/datadog-rum-provider';
import { GoogleTagManager } from '@/components/gtm';
import { Toaster } from 'sonner';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FloatingStoreCta } from '@/components/floating-store-cta';
import { ThemeProvider } from 'next-themes';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ouncetracker.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'OunceTracker - Bullion Price Comparison',
  description: 'Compare precious metal prices across multiple dealers',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
  },
  alternates: {
    types: {
      'application/rss+xml': `${BASE_URL}/feed.xml`,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-3872395478241915',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster />
        <GoogleTagManager />
        <DatadogRumProvider />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            {children}
            <SiteFooter />
            <FloatingStoreCta />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
