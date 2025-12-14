import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LayoutWrapper from '@/components/LayoutWrapper';
import { PostListItem } from '@/components/post-list-item';
import { Pagination } from '@/components/pagination';
import { sanityFetch } from '../../../insights/sanity/lib/live';
import {
  personQuery,
  paginatedPostsByAuthorQuery,
  postsByAuthorCountQuery,
} from '../../../insights/sanity/lib/queries';
import { urlForImage } from '../../../insights/sanity/lib/utils';

type Props = {
  params: Promise<{ id: string; page: string }>;
};

const POSTS_PER_PAGE = 5;

export const revalidate = 3600; // Revalidate every hour

/**
 * Generate metadata for the author page
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { data: person } = await sanityFetch({
    query: personQuery,
    params: { id: params.id },
    stega: false,
  });

  if (!person) {
    return {
      title: 'Author Not Found',
    };
  }

  const fullName = `${person.firstName} ${person.lastName}`;
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  return {
    title: `${fullName} - Author Profile | OunceTracker`,
    description: `View articles and insights by ${fullName} on OunceTracker`,
    metadataBase: new URL(url),
    alternates: {
      canonical: `/authors/${params.id}`,
    },
    openGraph: {
      type: 'profile',
      locale: 'en_US',
      url: `${url}/authors/${params.id}`,
      siteName: 'OunceTracker',
      title: `${fullName} - Author Profile`,
      description: `View articles and insights by ${fullName}`,
      images: person.picture?.asset?._ref
        ? [
            {
              url: urlForImage(person.picture)?.width(1200).height(630).fit('crop').url() || '',
              width: 1200,
              height: 630,
              alt: fullName,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary',
      title: `${fullName} - Author Profile`,
      description: `View articles and insights by ${fullName}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AuthorPage(props: Props) {
  const params = await props.params;
  const page = Number.parseInt(params.page, 10);
  const currentPage = page > 0 ? page : 1;

  const { data: person } = await sanityFetch({
    query: personQuery,
    params: { id: params.id },
  });

  if (!person?._id) {
    return notFound();
  }

  // Get total count for pagination
  const { data: totalCount } = await sanityFetch({
    query: postsByAuthorCountQuery,
    params: { authorId: person._id },
    stega: false,
  });

  const totalPages = Math.ceil((totalCount || 0) / POSTS_PER_PAGE);

  // Validate page number
  if (currentPage > totalPages && totalPages > 0) {
    return notFound();
  }

  // Get paginated posts
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const { data: posts } = await sanityFetch({
    query: paginatedPostsByAuthorQuery,
    params: { authorId: person._id, start, end },
    stega: false,
  });

  const fullName = `${person.firstName} ${person.lastName}`;

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Author Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            {person.picture?.asset?._ref ? (
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-border">
                <Image
                  src={
                    urlForImage(person.picture)?.width(256).height(256).fit('crop').url() as string
                  }
                  alt={person.picture?.alt || fullName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-border bg-muted text-2xl font-bold">
                {person.firstName?.[0]}
                {person.lastName?.[0]}
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{fullName}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {totalCount || 0} {totalCount === 1 ? 'article' : 'articles'} published
          </p>
        </div>

        {/* Author's Posts */}
        {posts && posts.length > 0 ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Articles by {person.firstName}</h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post: any) => (
                <PostListItem key={post._id} post={post} />
              ))}
            </ul>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={`/authors/${params.id}`}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {person.firstName} hasn&apos;t published any articles yet.
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/insights"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            &larr; Back to Insights
          </Link>
        </div>
      </div>
    </LayoutWrapper>
  );
}
