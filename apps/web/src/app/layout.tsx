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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" type="image/x-icon" href={`${BASE_URL}/favicon.ico`} />
      <link rel="apple-touch-icon" sizes="180x180" href={`${BASE_URL}/apple-touch-icon.png`} />
      <link rel="manifest" href={`${BASE_URL}/site.webmanifest`} />
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
