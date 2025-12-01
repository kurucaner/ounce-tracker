import type { MetadataRoute } from 'next';
import { sanityFetch } from './insights/sanity/lib/live';
import { sitemapData } from './insights/sanity/lib/queries';

// Revalidate sitemap every hour (3600 seconds)
export const revalidate = 3600;

// Type definitions for better type safety
type ChangeFrequency = 'monthly' | 'always' | 'hourly' | 'daily' | 'weekly' | 'yearly' | 'never';

interface SitemapItem {
  _type: 'page' | 'post';
  slug: string;
  _updatedAt?: string;
}

// Helper function to build dynamic routes
function buildDynamicRoutes(items: SitemapItem[], baseUrl: string): MetadataRoute.Sitemap {
  return items
    .filter((item) => item.slug) // Filter out items without slugs
    .map((item) => {
      const isPage = item._type === 'page';
      return {
        url: isPage ? `${baseUrl}/${item.slug}` : `${baseUrl}/insights/${item.slug}`,
        lastModified: item._updatedAt ? new Date(item._updatedAt) : new Date(),
        priority: isPage ? 0.8 : 0.5,
        changeFrequency: (isPage ? 'monthly' : 'never') as ChangeFrequency,
      };
    });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ouncetracker.com';
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insights/all-posts`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const allPostsAndPages = await sanityFetch({
      query: sitemapData,
      stega: false,
    });

    if (allPostsAndPages?.data && Array.isArray(allPostsAndPages.data)) {
      dynamicRoutes = buildDynamicRoutes(allPostsAndPages.data, baseUrl);
    }
  } catch (error) {
    // Log error but don't fail the sitemap - return static routes only
    console.error('Error fetching dynamic sitemap routes:', error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
