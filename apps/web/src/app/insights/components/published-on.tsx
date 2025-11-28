'use client';

import { parseLocalDate } from '@/lib/helpers';

export const PublishedOn = ({ date }: { date: string }) => {
  return (
    <dl>
      <dt className="sr-only">Published on</dt>
      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
        <time dateTime={date}>{parseLocalDate(date)}</time>
      </dd>
    </dl>
  );
};
