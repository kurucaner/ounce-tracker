import Link from 'next/link';
import { slug } from 'github-slugger';

interface Props {
  text: string;
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="relative mr-3 mb-2 inline-flex min-h-[44px] items-center overflow-hidden bg-transparent px-2 py-1.5 text-xs font-bold tracking-wide text-gray-900 uppercase transition-all duration-300 before:absolute before:bottom-0 before:left-0 before:-z-10 before:h-2 before:w-full before:bg-yellow-500 before:transition-all before:duration-500 hover:text-gray-900 hover:before:h-full dark:text-gray-100 dark:before:bg-emerald-400 dark:hover:text-gray-900 dark:hover:before:bg-emerald-300"
    >
      {text.split(' ').join('-')}
    </Link>
  );
};

export default Tag;
