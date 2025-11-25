import Link from 'next/link';

export const SiteFooter = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 md:h-16 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © {new Date().getFullYear()} OunceTracker
        </p>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms & Conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
};
SiteFooter.displayName = 'SiteFooter';
