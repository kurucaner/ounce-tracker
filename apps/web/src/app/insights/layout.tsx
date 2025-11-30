import type { Metadata } from 'next';
import { draftMode } from 'next/headers';

import { handleError } from './client-utils';
import DraftModeToast from './components/draft-mode-toast';
import { VisualEditingWrapper } from './components/visual-editing-wrapper';
import { sanityFetch, SanityLive } from './sanity/lib/live';
import { settingsQuery } from './sanity/lib/queries';
import { resolveOpenGraphImage } from './sanity/lib/utils';
import { GoogleNewsletterCta } from '@/components/google-newsletter-cta';

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({
    query: settingsQuery,
    stega: false,
  });
  const title = 'OunceTracker - Investment, Educational,Financial Insights and News';
  const description =
    'OunceTracker is a platform that provides investment, educational, financial insights and news. We are a team of experts who are passionate about helping people make better decisions with their money.';

  const ogImage = resolveOpenGraphImage(settings?.ogImage);

  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    metadataBase: new URL(url),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${url}/insights`,
      siteName: 'OunceTracker',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      creator: '@ouncetracker',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

interface InsightsLayoutProps {
  children: React.ReactNode;
}

export default async function InsightsLayout({ children }: Readonly<InsightsLayoutProps>) {
  const { isEnabled: isDraftMode } = await draftMode();
  // Only enable SanityLive in draft mode or development to avoid production performance impact
  const shouldEnableLive = isDraftMode || process.env.NODE_ENV === 'development';

  return (
    <div className="flex flex-col max-w-5xl mx-auto py-8 px-2">
      <GoogleNewsletterCta />
      {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
      {isDraftMode && (
        <>
          <DraftModeToast />
          {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
          <VisualEditingWrapper />
        </>
      )}
      {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should only be rendered in draft mode or development. */}
      {shouldEnableLive && <SanityLive onError={handleError} />}
      {children}
    </div>
  );
}
