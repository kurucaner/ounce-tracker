import React from 'react';

import { dataAttr } from '../sanity/lib/utils';
import Cta from './cta';
import Info from './info-section';

type BlockType = {
  _type: 'infoSection' | 'callToAction';
  _key: string;
  heading?: string;
};

type BlockProps = {
  index: number;
  block: BlockType;
  pageId: string;
  pageType: string;
};

const Blocks = {
  callToAction: Cta,
  infoSection: Info,
};

/**
 * Used by the <PageBuilder>, this component renders a the component that matches the block type.
 */
export default function BlockRenderer({
  block,
  index: _index,
  pageId,
  pageType,
}: Readonly<BlockProps>) {
  const Component = Blocks[block._type] as React.FC<{ block: BlockType }>;

  // Block does exist
  if (Component) {
    return (
      <div
        key={block._key}
        data-sanity={dataAttr({
          id: pageId,
          type: pageType,
          path: `pageBuilder[_key=="${block._key}"]`,
        }).toString()}
      >
        <Component key={block._key} block={block} />
      </div>
    );
  }
  // Block doesn't exist yet
  return React.createElement(
    () => (
      <div className="w-full rounded bg-gray-100 p-20 text-center text-gray-500">
        A &ldquo;{block._type}&rdquo; block hasn&apos;t been created
      </div>
    ),
    { key: block._key }
  );
}
