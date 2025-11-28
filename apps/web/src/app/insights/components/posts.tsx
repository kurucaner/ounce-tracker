import Link from 'next/link';

import Tag from '@/components/tag-f';
import type { AllPostsQueryResult } from '../sanity.types';
import { sanityFetch } from '../sanity/lib/live';
import { getLastTwentyPostsQuery, morePostsQuery } from '../sanity/lib/queries';
import Avatar from './avatar-f';
import DateComponent from './date';
import OnBoarding from './onboarding-f';
import { PublishedAt } from './published-at';

const Post = ({ post }: { post: AllPostsQueryResult[number] }) => {
  const { _id, title, slug, excerpt, date, author } = post;

  return (
    <article
      key={_id}
      className="group relative flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-lg"
    >
      <Link className="hover:text-brand transition-colors" href={`/insights/${slug}`}>
        <span className="absolute inset-0 z-10" />
      </Link>
      <div>
        <h3 className="group-hover:text-brand mb-3 text-xl leading-tight font-bold transition-colors">
          {title}
        </h3>

        <p className="line-clamp-3 text-sm leading-6 text-gray-600">{excerpt}</p>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        {author && author.firstName && author.lastName && (
          <div className="flex items-center">
            <Avatar person={author} small={true} />
          </div>
        )}
        <time className="font-mono text-xs text-gray-500" dateTime={date}>
          <DateComponent dateString={date} />
        </time>
      </div>
    </article>
  );
};

export const MorePosts = async ({ skip, limit }: { skip: string; limit: number }) => {
  const { data } = await sanityFetch({
    query: morePostsQuery,
    params: { skip, limit },
  });

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          More Articles
        </h2>
        <p className="text-base text-gray-600">Continue reading with these related posts</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {data?.map((post: AllPostsQueryResult[number]) => {
          return <Post key={post._id} post={post} />;
        })}
      </div>
    </div>
  );
};

export const AllPosts = async () => {
  const { data: posts } = await sanityFetch({ query: getLastTwentyPostsQuery });

  if (!posts || posts.length === 0) {
    return <OnBoarding />;
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {!posts.length && 'No posts found.'}
      {posts.map((post: AllPostsQueryResult[number]) => {
        const { _id, slug, date, title, excerpt, tags } = post;
        return (
          <li key={_id} className="py-12">
            <article>
              <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                <PublishedAt date={date} />
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
                        {tags?.map((tag) => {
                          return <Tag key={tag} text={tag} />;
                        })}
                      </div>
                    </div>
                    <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                      {excerpt}
                    </div>
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
  );
};
