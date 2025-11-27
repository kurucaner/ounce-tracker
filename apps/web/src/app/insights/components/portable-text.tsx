/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import { PortableText, type PortableTextComponents, type PortableTextBlock } from 'next-sanity';
import { Image } from 'next-sanity/image';
import { getImageDimensions } from '@sanity/asset-utils';
import { Link2 } from 'lucide-react';

import ResolvedLink from './resolved-link';
import { urlForImage } from '../sanity/lib/utils';

interface CustomPortableTextProps {
  className?: string;
  value: PortableTextBlock[];
}
export default function CustomPortableText({
  className,
  value,
}: Readonly<CustomPortableTextProps>) {
  const components: PortableTextComponents = {
    block: {
      h1: ({ children, value }) => (
        // Add an anchor to the h1
        <h1 className="group relative">
          {children}
          <a
            href={`#${value?._key}`}
            className="absolute top-0 bottom-0 left-0 -ml-6 flex items-center opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Link2 className="h-4 w-4" />
          </a>
        </h1>
      ),
      h2: ({ children, value }) => {
        // Add an anchor to the h2
        return (
          <h2 className="group relative">
            {children}
            <a
              href={`#${value?._key}`}
              className="absolute top-0 bottom-0 left-0 -ml-6 flex items-center opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Link2 className="h-4 w-4" />
            </a>
          </h2>
        );
      },
    },
    list: {
      bullet: ({ children }) => (
        <ul className="my-6 ml-6 list-disc space-y-2 [&>li]:pl-2 dark:[&>li]:text-gray-300">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="my-6 ml-6 list-decimal space-y-2 [&>li]:pl-2 dark:[&>li]:text-gray-300">
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>
      ),
      number: ({ children }) => (
        <li className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>
      ),
    },
    types: {
      image: ({ value }) => {
        if (!value?.asset?._ref) {
          return null;
        }
        return (
          <figure className="my-8">
            <Image
              className="w-full rounded-lg"
              src={urlForImage(value)?.url() as string}
              alt={value.alt || ' '}
              width={getImageDimensions(value).width}
              height={getImageDimensions(value).height}
              loading="lazy"
            />
            {value.alt && (
              <figcaption className="mt-2 text-center text-sm text-gray-600">
                {value.alt}
              </figcaption>
            )}
          </figure>
        );
      },
    },
    marks: {
      link: ({ children, value: link }) => {
        return <ResolvedLink link={link}>{children}</ResolvedLink>;
      },
    },
  };

  return (
    <div
      className={[
        'prose prose-lg prose-gray max-w-none',
        'prose-headings:font-bold prose-headings:tracking-tight',
        'prose-h1:text-3xl prose-h1:mb-4',
        'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-8',
        'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-6',
        'prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6',
        'prose-a:text-brand prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-gray-900 prose-strong:font-semibold',
        'prose-code:text-brand prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-blockquote:border-l-brand prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <PortableText components={components} value={value} />
    </div>
  );
}
