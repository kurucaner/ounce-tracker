import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes/index';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

const config = defineConfig({
  name: 'default',
  title: 'Ounce Tracker',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Settings')
              .child(S.document().schemaType('settings').documentId('settings')),
            S.divider(),
            S.listItem()
              .title('Posts')
              .schemaType('post')
              .child(S.documentTypeList('post').title('Posts')),
            S.listItem()
              .title('Authors')
              .schemaType('person')
              .child(S.documentTypeList('person').title('Authors')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
}) as ReturnType<typeof defineConfig>;

export default config;
