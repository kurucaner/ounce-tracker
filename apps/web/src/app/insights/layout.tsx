import type { Metadata } from 'next';
import { toPlainText } from 'next-sanity';
import { draftMode } from 'next/headers';

import { handleError } from './client-utils';
import DraftModeToast from './components/draft-mode-toast';
import { VisualEditingWrapper } from './components/visual-editing-wrapper';
import * as demo from './sanity/lib/demo';
import { sanityFetch, SanityLive } from './sanity/lib/live';
import { settingsQuery } from './sanity/lib/queries';
import { resolveOpenGraphImage } from './sanity/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({
    query: settingsQuery,
    stega: false,
  });
  const title = settings?.title || demo.title;
  const description = settings?.description || demo.description;

  const ogImage = resolveOpenGraphImage(settings?.ogImage);

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

interface InsightsLayoutProps {
  children: React.ReactNode;
}

export default async function InsightsLayout({ children }: Readonly<InsightsLayoutProps>) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <div className="flex flex-col max-w-5xl mx-auto py-12">
      {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
      {isDraftMode && (
        <>
          <DraftModeToast />
          {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
          <VisualEditingWrapper />
        </>
      )}
      {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
      <SanityLive onError={handleError} />
      {children}
    </div>
  );
}
