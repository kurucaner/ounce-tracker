import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const token = process.env.SANITY_API_TOKEN!;

console.log('projectId', projectId);
console.log('dataset', dataset);
console.log('token', token);

if (!projectId || !dataset || !token) {
  throw new Error('Missing Sanity environment variables');
}

// Create a write client
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion: '2025-09-25',
  useCdn: false,
  token,
});

export const POST = async (request: NextRequest) => {
  try {
    // Get the API key from headers for authentication
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.N8N_API_SECRET_KEY;

    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized - Invalid API Key' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!body.slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    if (!body.authorId) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 });
    }

    if (!body.content || !Array.isArray(body.content)) {
      return NextResponse.json(
        { error: 'Content is required and must be an array' },
        { status: 400 }
      );
    }

    // Create the post document
    const post: {
      _type: string;
      title: string;
      slug: { _type: string; current: string };
      excerpt: string;
      author: { _type: string; _ref: string };
      tags: string[];
      content: unknown[];
      date: string;
      coverImage?: {
        _type: 'image';
        asset: {
          _ref: string;
          _type: 'reference';
        };
        alt: string;
      };
    } = {
      _type: 'post',
      title: body.title,
      slug: {
        _type: 'slug',
        current: body.slug,
      },
      excerpt: body?.excerpt || '',
      author: {
        _type: 'reference',
        _ref: body?.authorId || '',
      },
      tags: body?.tags || [],
      content: body?.content || [],
      date: body.date || new Date().toISOString(),
    };

    // Only include coverImage if it's provided and not null
    if (body?.coverImage) {
      post.coverImage = body.coverImage;
    }

    // Create the document in Sanity
    const result = await writeClient.create(post);

    // Revalidate Next.js cache for the insights pages
    // This ensures the new post appears immediately in production
    try {
      // Revalidate the main insights page
      revalidatePath('/insights');
      // Revalidate the specific post page
      revalidatePath(`/insights/${body.slug}`);
      // Revalidate all insights pages using a tag (if you use tags elsewhere)
      revalidateTag('insights');
      // Revalidate sitemap
      revalidatePath('/sitemap.xml');
    } catch (revalidateError) {
      // Log but don't fail the request if revalidation fails
      console.error('Revalidation error (non-fatal):', revalidateError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Post created successfully',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      {
        error: 'Failed to create post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// GET endpoint to list all posts
export const GET = async () => {
  try {
    const posts = await writeClient.fetch(
      `*[_type == "post"] | order(date desc) {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        date,
        category,
        tags,
        "author": author->{firstName, lastName}
      }`
    );

    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
