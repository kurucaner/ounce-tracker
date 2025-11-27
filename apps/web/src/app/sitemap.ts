import type { MetadataRoute } from 'next';
import { sanityFetch } from './insights/sanity/lib/live';
import { sitemapData } from './insights/sanity/lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';

  const allPostsAndPages = await sanityFetch({
    query: sitemapData,
  });

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Add dynamic routes from Sanity (posts and pages)
  if (allPostsAndPages?.data && allPostsAndPages.data.length > 0) {
    for (const p of allPostsAndPages.data) {
      let priority: number;
      let changeFrequency:
        | 'monthly'
        | 'always'
        | 'hourly'
        | 'daily'
        | 'weekly'
        | 'yearly'
        | 'never'
        | undefined;
      let url: string;

      switch (p._type) {
        case 'page':
          priority = 0.8;
          changeFrequency = 'monthly';
          url = `${baseUrl}/${p.slug}`;
          break;
        case 'post':
          priority = 0.5;
          changeFrequency = 'never';
          url = `${baseUrl}/insights/${p.slug}`;
          break;
        default:
          continue;
      }

      routes.push({
        url,
        lastModified: p._updatedAt ? new Date(p._updatedAt) : new Date(),
        priority,
        changeFrequency,
      });
    }
  }

  return routes;
}
