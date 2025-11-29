import Link from 'next/link';

import type { Link as SanityLink } from '../sanity.types';
import { linkResolver } from '../sanity/lib/utils';

interface ResolvedLinkProps {
  link?: SanityLink;
  children: React.ReactNode;
  className?: string;
}

export default function ResolvedLink({ link, children, className }: Readonly<ResolvedLinkProps>) {
  // resolveLink() is used to determine the type of link and return the appropriate URL.
  const resolvedLink = linkResolver(link);

  if (typeof resolvedLink === 'string') {
    return (
      <Link
        href={resolvedLink}
        target={link?.openInNewTab ? '_blank' : undefined}
        rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}
