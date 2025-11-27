import { siteMetadata } from '@/lib/site-metadata';
import Link from 'next/link';
import { AllPosts } from './components/posts';
import { sanityFetch } from './sanity/lib/live';
import { allPostsQuery } from './sanity/lib/queries';

const MAX_DISPLAY = 15;

export default async function Page() {
  const { data: posts } = await sanityFetch({ query: allPostsQuery });
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Daily Mayhem
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <AllPosts />
      </div>
      {posts && posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/see-everything"
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
