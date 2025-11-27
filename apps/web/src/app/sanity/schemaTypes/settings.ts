import { defineField, defineType } from 'sanity';

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'object',
      fields: [
        {
          name: 'metadataBase',
          type: 'url',
          title: 'Metadata Base URL',
        },
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      };
    },
  },
});
