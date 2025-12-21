import { generateFeed } from '@/lib/generate-feed';

export async function GET() {
  const feed = await generateFeed();

  return new Response(feed.atom1(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
