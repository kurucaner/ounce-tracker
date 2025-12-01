import Link from 'next/link';
import type { Metadata } from 'next';
import { slug } from 'github-slugger';
import { parseLocalDate } from '@/lib/helpers';
import Tag from '@/components/tag-f';
import { sanityFetch } from '@/app/insights/sanity/lib/live';
import {
  allPostsQuery,
  paginatedPostsQuery,
  postsCountQuery,
} from '@/app/insights/sanity/lib/queries';
import type { AllPostsQueryResult } from '@/app/insights/sanity.types';

const POSTS_PER_PAGE = 5;

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

function Pagination({ totalPages, currentPage }: Readonly<PaginationProps>) {
  const prevPage = currentPage - 1 > 0;
  const nextPage = currentPage + 1 <= totalPages;

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={
              currentPage - 1 === 1
                ? '/insights/all-posts'
                : `/insights/all-posts/${currentPage - 1}`
            }
            rel="prev"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Previous
          </Link>
        )}
        <span className="text-gray-500 dark:text-gray-400">
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link
            href={`/insights/all-posts/${currentPage + 1}`}
            rel="next"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}

// Calculate tag counts from posts
function calculateTagCounts(posts: AllPostsQueryResult): Record<string, number> {
  const tagCounts: Record<string, number> = {};
  posts.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  return tagCounts;
}

interface ListLayoutWithTagsProps {
  posts: AllPostsQueryResult;
  title: string;
  initialDisplayPosts?: AllPostsQueryResult;
  pagination?: PaginationProps;
}

function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: Readonly<ListLayoutWithTagsProps>) {
  const tagCounts = calculateTagCounts(posts);
  const tagKeys = Object.keys(tagCounts);
  const sortedTags = tagKeys.toSorted((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0));

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts;

  return (
    <div>
      <div className="pt-6 pb-6">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {title}
        </h1>
      </div>
      <div className="flex sm:space-x-24">
        <div className="hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
          <div className="px-6 py-4">
            <h3 className="text-primary-500 font-bold uppercase">All Posts</h3>
            <ul>
              {sortedTags.map((t) => {
                return (
                  <li key={t} className="my-3">
                    <Link
                      href={`/tags/${slug(t)}`}
                      className="hover:text-primary-500 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                      aria-label={`View posts tagged ${t}`}
                    >
                      {`${t} (${tagCounts[t]})`}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div>
          {displayPosts.length === 0 ? (
            <div className="py-5 text-center">
              <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
            </div>
          ) : (
            <ul>
              {displayPosts.map((post) => {
                const { _id, slug: postSlug, date, title: postTitle, excerpt, tags } = post;
                return (
                  <li key={_id} className="py-5">
                    <article className="flex flex-col space-y-2 xl:space-y-0">
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                          <time dateTime={date} suppressHydrationWarning>
                            {parseLocalDate(date)}
                          </time>
                        </dd>
                      </dl>
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/insights/${postSlug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {postTitle}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => {
                              return <Tag key={tag} text={tag} />;
                            })}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {excerpt}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'All Posts | Investment Insights | OunceTracker';
  const description =
    'Browse all investment insights, educational content, and financial news about precious metals and bullion investing.';
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  return {
    title,
    description,
    metadataBase: new URL(url),
    alternates: {
      canonical: '/insights/all-posts',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${url}/insights/all-posts`,
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

export const revalidate = 3600; // Revalidate every hour

export default async function AllPostsContent() {
  // Get all posts for tag counting
  const { data: allPosts } = await sanityFetch({
    query: allPostsQuery,
    stega: false,
  });

  // Get total count for pagination
  const { data: totalCount } = await sanityFetch({
    query: postsCountQuery,
    stega: false,
  });

  const totalPages = Math.ceil((totalCount || 0) / POSTS_PER_PAGE);
  const currentPage = 1;

  // Get first page of posts
  const start = 0;
  const end = POSTS_PER_PAGE;
  const { data: posts } = await sanityFetch({
    query: paginatedPostsQuery,
    params: { start, end },
    stega: false,
  });

  return (
    <ListLayoutWithTags
      posts={allPosts || []}
      title="All Posts"
      initialDisplayPosts={posts || []}
      pagination={
        totalPages > 1
          ? {
              totalPages,
              currentPage,
            }
          : undefined
      }
    />
  );
}
