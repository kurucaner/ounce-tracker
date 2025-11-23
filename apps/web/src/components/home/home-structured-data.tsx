interface StructuredDataProps {
  products?: Array<{
    id: string;
    name: string;
    mint: string;
    metal: string;
    form: string;
    weight_oz: number;
  }>;
}

/**
 * Generate JSON-LD structured data for SEO
 */
export function HomeStructuredData({ products }: Readonly<StructuredDataProps>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  // Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OunceTracker',
    url: siteUrl,
    description: 'Compare precious metal prices from trusted bullion dealers',
    // Logo can be added later when logo.png is created
    // logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Add social media links when available
      // 'https://twitter.com/ouncetracker',
      // 'https://facebook.com/ouncetracker',
    ],
  };

  // Website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OunceTracker',
    url: siteUrl,
    description: 'Compare prices for precious metal products from multiple bullion dealers',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?product={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Price comparison service schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Price Comparison Service',
    name: 'Precious Metal Price Comparison',
    description:
      'Real-time price comparison for gold bars, silver coins, and other precious metal products from trusted bullion dealers',
    provider: {
      '@type': 'Organization',
      name: 'OunceTracker',
    },
    areaServed: 'US',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: siteUrl,
      serviceType: 'Online',
    },
  };

  // Product schemas (if products are provided)
  const productSchemas =
    products?.map((product) => ({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: `${product.weight_oz} oz ${product.metal} ${product.form} from ${product.mint}`,
      brand: {
        '@type': 'Brand',
        name: product.mint,
      },
      category: product.metal,
      weight: {
        '@type': 'QuantitativeValue',
        value: product.weight_oz,
        unitCode: 'OZT', // Troy Ounce
      },
      offers: {
        '@type': 'AggregateOffer',
        offerCount: 'Multiple',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/?product=${product.id}`,
      },
    })) || [];

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
    ],
  };

  const allSchemas = [
    organizationSchema,
    websiteSchema,
    serviceSchema,
    breadcrumbSchema,
    ...productSchemas,
  ];

  return (
    <>
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
