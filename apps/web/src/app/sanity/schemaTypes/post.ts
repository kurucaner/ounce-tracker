import { defineField, defineType } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'person' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Chess', value: 'chess' },
          { title: 'F1', value: 'f1' },
          { title: 'Sports', value: 'sports' },
          { title: 'Technology', value: 'technology' },
          { title: 'General', value: 'general' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'block',
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'linkType',
                    type: 'string',
                    title: 'Link Type',
                    options: {
                      list: [
                        { title: 'URL', value: 'href' },
                        { title: 'Page', value: 'page' },
                        { title: 'Post', value: 'post' },
                      ],
                      layout: 'radio',
                    },
                  },
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    hidden: ({ parent }) => parent?.linkType !== 'href',
                  },
                  {
                    name: 'page',
                    type: 'reference',
                    title: 'Page',
                    to: [{ type: 'page' }],
                    hidden: ({ parent }) => parent?.linkType !== 'page',
                  },
                  {
                    name: 'post',
                    type: 'reference',
                    title: 'Post',
                    to: [{ type: 'post' }],
                    hidden: ({ parent }) => parent?.linkType !== 'post',
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.firstName',
      media: 'coverImage',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author && `by ${author}`,
        media,
      };
    },
  },
});
