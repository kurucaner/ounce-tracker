import { getImageDimensions } from '@sanity/asset-utils';
import { stegaClean } from '@sanity/client/stega';
import { Image } from 'next-sanity/image';
import type { SanityImage } from '../sanity.types';
import { urlForImage } from '../sanity/lib/utils';

interface CoverImageProps {
  image: SanityImage;
  priority?: boolean;
}

export default function CoverImage(props: Readonly<CoverImageProps>) {
  const { image: source, priority } = props;
  const image = source?.asset?._ref ? (
    <Image
      className="h-full w-full object-cover"
      width={getImageDimensions(source?.asset?._ref).width}
      height={getImageDimensions(source?.asset?._ref).height}
      alt={stegaClean(source?.alt) || ''}
      src={urlForImage(source)?.url() as string}
      priority={priority}
    />
  ) : null;

  return <div className="relative h-full w-full">{image}</div>;
}
