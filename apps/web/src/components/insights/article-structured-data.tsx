interface ArticleStructuredDataProps {
  title: string;
  description?: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  publisher?: {
    name: string;
    logo?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
}

/**
 * Generate JSON-LD structured data for Article (BlogPost) SEO
 * Follows Schema.org Article specification for rich snippets
 */
export function ArticleStructuredData({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author,
  image,
  publisher = {
    name: 'OunceTracker',
    logo: {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com'}/logo.png`,
      width: 512,
      height: 512,
    },
  },
}: Readonly<ArticleStructuredDataProps>) {
  // Build author name
  const authorName =
    author?.name ||
    (author?.firstName && author?.lastName
      ? `${author.firstName} ${author.lastName}`
      : 'OunceTracker');

  // Article schema following Schema.org Article specification
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || title,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: publisher.logo
        ? {
            '@type': 'ImageObject',
            url: publisher.logo.url,
            width: publisher.logo.width,
            height: publisher.logo.height,
          }
        : undefined,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: image
      ? {
          '@type': 'ImageObject',
          url: image.url,
          width: image.width,
          height: image.height,
        }
      : undefined,
  };

  // Remove undefined fields to keep JSON clean
  const cleanSchema = Object.fromEntries(
    Object.entries(articleSchema).filter(([_, value]) => value !== undefined)
  ) as Record<string, unknown>;

  // Clean nested objects too
  if (
    cleanSchema.publisher &&
    typeof cleanSchema.publisher === 'object' &&
    'logo' in cleanSchema.publisher &&
    cleanSchema.publisher.logo === undefined
  ) {
    delete (cleanSchema.publisher as { logo?: unknown }).logo;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}
