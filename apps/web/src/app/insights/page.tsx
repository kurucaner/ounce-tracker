import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ComingSoon } from '@/components/coming-soon';

export const metadata = {
  title: 'Insights | OunceTracker',
  description: 'Market reports, news, and analysis for precious metals',
};

export default function InsightsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ComingSoon
          title="Insights Coming Soon"
          description="We're preparing market reports, news, and analysis for precious metals. Stay tuned for valuable insights to help you make informed decisions."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
