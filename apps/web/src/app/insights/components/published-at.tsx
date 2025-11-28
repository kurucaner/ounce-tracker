'use client';

import { parseLocalDate } from '@/lib/helpers';

export const PublishedAt = ({ date }: { date: string }) => {
  return (
    <dl className="space-y-10">
      <dt className="sr-only">Published on</dt>
      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
        <time dateTime={date}>{parseLocalDate(date)}</time>
      </dd>
    </dl>
  );
};
