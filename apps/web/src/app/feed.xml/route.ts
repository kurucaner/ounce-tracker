import { Feed } from 'feed';
import { sanityFetch } from '@/app/insights/sanity/lib/live';
import { allPostsQuery } from '@/app/insights/sanity/lib/queries';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ouncetracker.com';

export async function GET() {
  const { data: posts } = await sanityFetch({ query: allPostsQuery });

  const feed = new Feed({
    title: 'OunceTracker - Investment Insights',
    description:
      'Learn about the latest trends in the investment world. Educational content, financial insights, and news about precious metals and bullion investing.',
    id: BASE_URL,
    link: BASE_URL,
    language: 'en',
    image: `${BASE_URL}/logo.png`,
    favicon: `${BASE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, OunceTracker`,
    updated: posts?.[0]?.date ? new Date(posts[0].date) : new Date(),
    feedLinks: {
      rss: `${BASE_URL}/feed.xml`,
      atom: `${BASE_URL}/atom.xml`,
      json: `${BASE_URL}/feed.json`,
    },
    author: {
      name: 'OunceTracker',
      link: BASE_URL,
    },
  });

  if (posts && posts.length > 0) {
    posts.forEach((post) => {
      const postUrl = `${BASE_URL}/insights/${post.slug}`;
      const author = post.author
        ? `${post.author.firstName} ${post.author.lastName}`.trim()
        : 'OunceTracker';

      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.excerpt || '',
        content: post.excerpt || '',
        author: [
          {
            name: author,
          },
        ],
        date: new Date(post.date),
        image: post.coverImage?.asset?.url || post.coverImage?.url,
      });
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

