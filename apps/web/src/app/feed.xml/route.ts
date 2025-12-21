import { generateFeed } from '@/lib/generate-feed';

export async function GET() {
  const feed = await generateFeed();

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
