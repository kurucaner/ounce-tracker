import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/query-provider';
import { DatadogRumProvider } from '@/components/datadog-rum-provider';

const inter = Inter({ subsets: ['latin'] });

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
      <link
        rel="android-chrome-192x192"
        type="image/png"
        sizes="192x192"
        href="/android-chrome-192x192.png"
      />
      <link
        rel="android-chrome-512x512"
        type="image/png"
        sizes="512x512"
        href="/android-chrome-512x512.png"
      />
      <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="favicon-32x32" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="favicon-16x16" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="favicon" type="image/x-icon" sizes="any" href="/favicon.ico" />
      <body className={inter.className}>
        <DatadogRumProvider />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
