import { Image } from 'next-sanity/image';
import Link from 'next/link';

import type { SanityImage } from '../sanity.types';
import { urlForImage } from '../sanity/lib/utils';
import DateComponent from './date';

type Props = {
  person: {
    _id?: string;
    firstName: string | null;
    lastName: string | null;
    picture?: SanityImage;
  };
  date?: string;
  small?: boolean;
};

export default function Avatar({ person, date, small = false }: Readonly<Props>) {
  const { _id, firstName, lastName, picture } = person;
  const nameContent = firstName && lastName ? (
    _id ? (
      <Link
        href={`/authors/${_id}`}
        className="hover:text-primary transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {firstName} {lastName}
      </Link>
    ) : (
      <span>
        {firstName} {lastName}
      </span>
    )
  ) : null;

  return (
    <div className="flex items-center font-mono">
      {picture?.asset?._ref ? (
        <div className={`${small ? 'mr-2 h-6 w-6' : 'mr-4 h-9 w-9'}`}>
          <Image
            alt={picture?.alt || ''}
            className="h-full rounded-full object-cover"
            height={small ? 32 : 48}
            width={small ? 32 : 48}
            src={
              urlForImage(picture)
                ?.height(small ? 64 : 96)
                .width(small ? 64 : 96)
                .fit('crop')
                .url() as string
            }
          />
        </div>
      ) : (
        <div className="mr-1">By </div>
      )}
      <div className="flex flex-col">
        {nameContent && (
          <div className={`font-bold ${small ? 'text-sm' : ''}`}>{nameContent}</div>
        )}
        {date && (
          <div className={`text-gray-500 ${small ? 'text-xs' : 'text-sm'}`}>
            <DateComponent dateString={date} />
          </div>
        )}
      </div>
    </div>
  );
}
