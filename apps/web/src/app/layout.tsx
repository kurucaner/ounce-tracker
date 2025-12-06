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

export const metadata: Metadata = {
  title: 'OunceTracker - Bullion Price Comparison',
  description: 'Compare precious metal prices across multiple dealers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
      <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/ico" href="/favicon.ico" />
      <link rel="manifest" href="/site.webmanifest" />
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
