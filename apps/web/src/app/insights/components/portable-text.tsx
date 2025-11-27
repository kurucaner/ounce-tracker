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
import { Link, SanityImage } from '../sanity.types';

interface CustomPortableTextProps {
  className?: string;
  value: PortableTextBlock[];
}

// Helper function to generate a slug from text content
function generateSlug(children: React.ReactNode): string {
  let text = '';

  if (typeof children === 'string') {
    text = children;
  } else if (Array.isArray(children)) {
    text = children.map((child) => (typeof child === 'string' ? child : '')).join('');
  }

  if (!text) {
    return 'heading';
  }

  return (
    text
      .toLowerCase()
      .trim()
      .replaceAll(/[^\w\s-]/g, '')
      .replaceAll(/[\s_-]+/g, '-')
      .replaceAll(/^(-+|-+)$/g, '') || 'heading'
  );
}

const renderH1 = ({ children, value }: { children?: React.ReactNode; value: unknown }) => {
  const slug = (value as { _key?: string })?._key || generateSlug(children);
  return (
    <h1 id={slug} className="group relative font-bold mb-6 scroll-mt-20">
      {children}
      <a
        href={`#${slug}`}
        className="absolute top-0 bottom-0 left-0 -ml-6 flex items-center opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Link2 className="h-4 w-4" />
      </a>
    </h1>
  );
};

const renderH2 = ({ children, value }: { children?: React.ReactNode; value: unknown }) => {
  const slug = (value as { _key?: string })?._key || generateSlug(children);
  return (
    <h2 id={slug} className="group relative font-bold mb-2 scroll-mt-20">
      {children}
      <a
        href={`#${slug}`}
        className="absolute top-0 bottom-0 left-0 -ml-6 flex items-center opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Link2 className="h-4 w-4" />
      </a>
    </h2>
  );
};

const renderH3 = ({ children, value }: { children?: React.ReactNode; value: unknown }) => {
  const slug = (value as { _key?: string })?._key || generateSlug(children);
  return (
    <h3 id={slug} className="group relative font-bold mb-2 scroll-mt-20">
      {children}
      <a
        href={`#${slug}`}
        className="absolute top-0 bottom-0 left-0 -ml-6 flex items-center opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Link2 className="h-4 w-4" />
      </a>
    </h3>
  );
};

const renderNormal = ({ children }: { children?: React.ReactNode }) => {
  return <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{children}</p>;
};

const renderHr = () => {
  return <hr className="my-8 border-t border-gray-300 dark:border-gray-700" />;
};

const renderBulletList = ({ children }: { children?: React.ReactNode }) => {
  return (
    <ul className="my-6 ml-6 list-disc space-y-2 [&>li]:pl-2 dark:[&>li]:text-gray-300">
      {children}
    </ul>
  );
};

const renderNumberList = ({ children }: { children?: React.ReactNode }) => {
  return (
    <ol className="my-6 ml-6 list-decimal space-y-2 [&>li]:pl-2 dark:[&>li]:text-gray-300">
      {children}
    </ol>
  );
};

const renderBulletListItem = ({ children }: { children?: React.ReactNode }) => {
  return <li className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>;
};

const renderNumberListItem = ({ children }: { children?: React.ReactNode }) => {
  return <li className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>;
};

const renderImage = ({ value }: { value: SanityImage }) => {
  if (!value?.asset?._ref) {
    return null;
  }
  return (
    <figure className="my-8">
      <Image
        className="w-full rounded-lg"
        src={urlForImage(value)?.url() as string}
        alt={value.alt || ' '}
        width={getImageDimensions(value?.asset?._ref).width}
        height={getImageDimensions(value?.asset?._ref).height}
        loading="lazy"
      />
      {value.alt && (
        <figcaption className="mt-2 text-center text-sm text-gray-600">{value.alt}</figcaption>
      )}
    </figure>
  );
};

interface RenderLinkProps {
  children: React.ReactNode;
  value?: Link;
}
const renderLink = ({ children, value: link }: RenderLinkProps) => {
  return <ResolvedLink link={link}>{children}</ResolvedLink>;
};

export default function CustomPortableText({
  className,
  value,
}: Readonly<CustomPortableTextProps>) {
  const components: PortableTextComponents = {
    block: {
      h1: renderH1,
      h2: renderH2,
      h3: renderH3,
      normal: renderNormal,
      hr: renderHr,
    },
    list: {
      bullet: renderBulletList,
      number: renderNumberList,
    },
    listItem: {
      bullet: renderBulletListItem,
      number: renderNumberListItem,
    },
    types: {
      image: renderImage,
    },
    marks: {
      link: renderLink,
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
