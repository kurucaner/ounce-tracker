import { defineQuery } from 'next-sanity';

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`);

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  _updatedAt,
  "author": author->{_id, firstName, lastName, picture},
  tags,
`;

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`;

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`;

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ${linkFields},
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`);

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`);

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`);

export const getLastTwentyPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) [0...20] {
    ${postFields}
  }
`);

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`);

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`);

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current, title}
`);

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`);

// Get all unique tags from posts
export const allTagsQuery = defineQuery(`
  array::unique(*[_type == "post" && defined(tags) && count(tags) > 0].tags[])
`);

// Get posts by tag
export const postsByTagQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && $tag in tags] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`);

// Get paginated posts (for all-posts page)
export const paginatedPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) [$start...$end] {
    ${postFields}
  }
`);

// Get total count of posts (for pagination)
export const postsCountQuery = defineQuery(`
  count(*[_type == "post" && defined(slug.current)])
`);

// Get person by ID
export const personQuery = defineQuery(`
  *[_type == "person" && _id == $id][0] {
    _id,
    firstName,
    lastName,
    picture
  }
`);

// Get all posts by a specific author
export const postsByAuthorQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && author._ref == $authorId] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`);

// Get all person IDs (for static generation)
export const allPersonIdsQuery = defineQuery(`
  *[_type == "person"] {
    "_id": _id
  }
`);
