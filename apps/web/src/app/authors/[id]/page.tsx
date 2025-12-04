import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LayoutWrapper from '@/components/LayoutWrapper';
import { sanityFetch } from '../../insights/sanity/lib/live';
import { personQuery, postsByAuthorQuery } from '../../insights/sanity/lib/queries';
import { urlForImage } from '../../insights/sanity/lib/utils';
import DateComponent from '../../insights/components/date';
import CoverImage from '../../insights/components/cover-image';

type Props = {
  params: Promise<{ id: string }>;
};

export const revalidate = 3600; // Revalidate every hour

/**
 * Generate static params for all authors
 */
export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: `*[_type == "person"] { "_id": _id }`,
    perspective: 'published',
    stega: false,
  });

  return data.map((person: { _id: string }) => ({
    id: person._id,
  }));
}

/**
 * Generate metadata for the author page
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { data: person } = await sanityFetch({
    query: personQuery,
    params,
    stega: false,
  });

  if (!person) {
    return {
      title: 'Author Not Found',
    };
  }

  const fullName = `${person.firstName} ${person.lastName}`;
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  return {
    title: `${fullName} - Author Profile | OunceTracker`,
    description: `View articles and insights by ${fullName} on OunceTracker`,
    metadataBase: new URL(url),
    alternates: {
      canonical: `/authors/${params.id}`,
    },
    openGraph: {
      type: 'profile',
      locale: 'en_US',
      url: `${url}/authors/${params.id}`,
      siteName: 'OunceTracker',
      title: `${fullName} - Author Profile`,
      description: `View articles and insights by ${fullName}`,
      images: person.picture?.asset?._ref
        ? [
            {
              url: urlForImage(person.picture)?.width(1200).height(630).fit('crop').url() || '',
              width: 1200,
              height: 630,
              alt: fullName,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary',
      title: `${fullName} - Author Profile`,
      description: `View articles and insights by ${fullName}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AuthorPage(props: Props) {
  const params = await props.params;
  const { data: person } = await sanityFetch({
    query: personQuery,
    params,
  });

  if (!person?._id) {
    return notFound();
  }

  const { data: posts } = await sanityFetch({
    query: postsByAuthorQuery,
    params: { authorId: person._id },
  });

  const fullName = `${person.firstName} ${person.lastName}`;

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Author Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            {person.picture?.asset?._ref ? (
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-border">
                <Image
                  src={
                    urlForImage(person.picture)?.width(256).height(256).fit('crop').url() as string
                  }
                  alt={person.picture?.alt || fullName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-border bg-muted text-2xl font-bold">
                {person.firstName?.[0]}
                {person.lastName?.[0]}
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{fullName}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {posts?.length || 0} {posts?.length === 1 ? 'article' : 'articles'} published
          </p>
        </div>

        {/* Author's Posts */}
        {posts && posts.length > 0 ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Articles by {person.firstName}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                <article
                  key={post._id}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <Link href={`/insights/${post.slug}`} className="absolute inset-0 z-10" />
                  {post.coverImage?.asset?._ref && (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <CoverImage image={post.coverImage} priority={false} />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 text-xl font-bold leading-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                      <time className="text-xs text-muted-foreground" dateTime={post.date}>
                        <DateComponent dateString={post.date} />
                      </time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {person.firstName} hasn&apos;t published any articles yet.
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12">
          <Link
            href="/insights"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            &larr; Back to Insights
          </Link>
        </div>
      </div>
    </LayoutWrapper>
  );
}
