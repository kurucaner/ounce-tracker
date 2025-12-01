import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { slug } from 'github-slugger';

import LayoutWrapper from '@/components/LayoutWrapper';
import Tag from '@/components/tag-f';
import { parseLocalDate } from '@/lib/helpers';
import { sanityFetch } from '../../insights/sanity/lib/live';
import { allTagsQuery, postsByTagQuery } from '../../insights/sanity/lib/queries';
import type { AllPostsQueryResult } from '../../insights/sanity.types';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const { data: tags } = await sanityFetch({
    query: allTagsQuery,
    perspective: 'published',
    stega: false,
  });

  if (!tags || tags.length === 0) {
    return [];
  }

  return tags.map((tag: string) => ({
    slug: slug(tag),
  }));
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const tagSlug = params.slug;

  // Fetch all tags to find the matching tag name
  const { data: allTags } = await sanityFetch({
    query: allTagsQuery,
    stega: false,
  });

  // Find the tag that matches the slug
  const matchingTag = allTags?.find((tag: string) => slug(tag) === tagSlug);
  const tagName =
    matchingTag ||
    tagSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  return {
    title: `Posts tagged with "${tagName}" | OunceTracker`,
    description: `Browse all posts tagged with "${tagName}" on OunceTracker. Discover insights, analysis, and educational content about ${tagName.toLowerCase()} and precious metals investing.`,
    metadataBase: new URL(url),
    alternates: {
      canonical: `/tags/${tagSlug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${url}/tags/${tagSlug}`,
      siteName: 'OunceTracker',
      title: `Posts tagged with "${tagName}" | OunceTracker`,
      description: `Browse all posts tagged with "${tagName}" on OunceTracker`,
    },
    twitter: {
      card: 'summary',
      title: `Posts tagged with "${tagName}" | OunceTracker`,
      description: `Browse all posts tagged with "${tagName}" on OunceTracker`,
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
  } satisfies Metadata;
}

export default async function TagPage(props: Props) {
  const params = await props.params;
  const tagSlug = params.slug;

  // Fetch all tags to find the matching tag name
  const { data: allTags } = await sanityFetch({
    query: allTagsQuery,
    stega: false,
  });

  // Find the tag that matches the slug
  const matchingTag = allTags?.find((tag: string) => slug(tag) === tagSlug);

  if (!matchingTag) {
    return notFound();
  }

  const tagName = matchingTag;

  // Fetch posts by tag
  const { data: posts } = await sanityFetch({
    query: postsByTagQuery,
    params: { tag: tagName },
    stega: false,
  });

  if (!posts || posts.length === 0) {
    return notFound();
  }

  return (
    <LayoutWrapper>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-2xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-3xl sm:leading-9 md:text-4xl md:leading-10 dark:text-gray-100">
            Posts tagged with &quot;{tagName}&quot;
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post: AllPostsQueryResult[number]) => {
            const { _id, slug, date, title, excerpt, tags } = post;
            return (
              <li key={_id} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{parseLocalDate(date)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/insights/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag: string) => {
                              return <Tag key={tag} text={tag} />;
                            })}
                          </div>
                        </div>
                        {excerpt && (
                          <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                            {excerpt}
                          </div>
                        )}
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/insights/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </LayoutWrapper>
  );
}
