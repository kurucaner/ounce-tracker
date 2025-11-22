export const SiteFooter = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with Next.js, Bun & Supabase
        </p>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          © {new Date().getFullYear()} OunceTracker
        </p>
      </div>
    </footer>
  );
};
SiteFooter.displayName = 'SiteFooter';

