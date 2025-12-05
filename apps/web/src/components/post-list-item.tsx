import Link from 'next/link';
import Tag from '@/components/tag-f';
import type { AllPostsQueryResult } from '@/app/insights/sanity.types';
import { parseLocalDate } from '@/lib/helpers';
import { PublishedAt } from '@/app/insights/components/published-at';

interface PostListItemProps {
  post: AllPostsQueryResult[number];
}

export function PostListItem({ post }: Readonly<PostListItemProps>) {
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
}

