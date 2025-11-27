import { type PortableTextBlock } from 'next-sanity';

import { InfoSection } from '../sanity.types';
import PortableText from './portable-text';

type InfoProps = {
  block: InfoSection;
};

export default function Info({ block }: Readonly<InfoProps>) {
  return (
    <div className="container my-12">
      <div className="max-w-3xl">
        {block?.heading && (
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">{block.heading}</h2>
        )}
        {block?.subheading && (
          <span className="mt-4 mb-8 block text-lg font-light text-gray-900/70 uppercase">
            {block.subheading}
          </span>
        )}
        <div className="mt-4">
          {block?.content?.length && (
            <PortableText className="" value={block.content as PortableTextBlock[]} />
          )}
        </div>
      </div>
    </div>
  );
}
