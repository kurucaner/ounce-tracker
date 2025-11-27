import type { Metadata, ResolvingMetadata } from 'next';
import { type PortableTextBlock } from 'next-sanity';
import { notFound } from 'next/navigation';

import LayoutWrapper from '@/components/LayoutWrapper';
import PageTitle from '@/components/page-title';
import ScrollTopAndComment from '@/components/scroll-top-and-comment';
import Tag from '@/components/tag-f';
import Image from 'next/image';
import Link from 'next/link';
import PortableText from '../components/portable-text';
import CoverImage from '../components/cover-image';
import { sanityFetch } from '../sanity/lib/live';
import { postPagesSlugs, postQuery } from '../sanity/lib/queries';
import { resolveOpenGraphImage, urlForImage } from '../sanity/lib/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: postPagesSlugs,
    // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  });
  return data;
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const { data: post } = await sanityFetch({
    query: postQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  });
  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = resolveOpenGraphImage(post?.coverImage);

  return {
    authors:
      post?.author?.firstName && post?.author?.lastName
        ? [{ name: `${post.author.firstName} ${post.author.lastName}` }]
        : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata;
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  const { data: post } = await sanityFetch({ query: postQuery, params });
  console.log('post', post);
  const { data: allPosts } = await sanityFetch({ query: postPagesSlugs, stega: false });

  if (!post?._id) {
    return notFound();
  }

  const postIndex = allPosts.findIndex((p: { slug: string }) => p.slug === post.slug);
  const prev = allPosts[postIndex + 1];
  const next = allPosts[postIndex - 1];

  console.log('post', post);

  return (
    <LayoutWrapper>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{post.title}</PageTitle>
              </div>
            </div>
          </header>
          {post.coverImage?.asset?._ref && (
            <div className="mb-12 -mx-4 sm:mx-0 xl:mx-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <div className="absolute inset-0">
                  <CoverImage image={post.coverImage} priority />
                </div>
              </div>
            </div>
          )}
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0 dark:divide-gray-700">
            <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0">
                  <li className="flex items-center space-x-2">
                    {post.author?.picture?.asset?._ref && (
                      <Image
                        src={
                          urlForImage(post.author.picture)
                            ?.width(76)
                            .height(76)
                            .fit('crop')
                            .url() as string
                        }
                        alt={post.author.picture?.alt || 'author'}
                        className="h-10 w-10 rounded-full"
                        width={38}
                        height={38}
                      />
                    )}
                    <dl className="text-sm leading-5 font-medium whitespace-nowrap">
                      <dt className="sr-only">Name</dt>
                      <dd className="text-gray-900 dark:text-gray-100">
                        {post.author?.firstName} {post.author?.lastName}
                      </dd>
                    </dl>
                  </li>
                </ul>
              </dd>
            </dl>
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              <div className="prose dark:prose-invert max-w-none pt-10 pb-8">
                {post.content?.length && (
                  <PortableText value={post.content as PortableTextBlock[]} />
                )}
              </div>
            </div>
            <footer>
              <div className="divide-gray-200 text-sm leading-5 font-medium xl:col-start-1 xl:row-start-2 xl:divide-y dark:divide-gray-700">
                {post.tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      Tags
                    </h2>
                    <div className="flex flex-wrap">
                      {post.tags.map((tag: string) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev && prev.slug && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Previous Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/insights/${prev.slug}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {next && next.slug && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Next Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/insights/${next.slug}`}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 xl:pt-8">
                <Link
                  href="/insights"
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Back to the insights"
                >
                  &larr; Back to the insights
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </LayoutWrapper>
  );
}
