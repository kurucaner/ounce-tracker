import Link from 'next/link';
import type { Metadata } from 'next';
import { AllPosts } from './components/posts';
import { sanityFetch } from './sanity/lib/live';
import { getLastTwentyPostsQuery } from './sanity/lib/queries';

const MAX_DISPLAY = 20;

// Allow on-demand revalidation via revalidatePath in the n8n route
// Pages are cached for performance but can be revalidated when new posts are created
export const revalidate = 3600; // Revalidate every hour, or on-demand via revalidatePath

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Investment Insights | OunceTracker';
  const description =
    'Learn about the latest trends in the investment world. Educational content, financial insights, and news about precious metals and bullion investing.';
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  return {
    title,
    description,
    metadataBase: new URL(url),
    alternates: {
      canonical: '/insights',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${url}/insights`,
      siteName: 'OunceTracker',
      title,
      description,
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

export default async function Page() {
  const { data: posts } = await sanityFetch({ query: getLastTwentyPostsQuery });
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Investment Insights
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Learn about the latest trends in the investment world.
          </p>
        </div>
        <AllPosts />
      </div>
      {posts && posts.length > 0 && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/insights/all-posts"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  );
}
