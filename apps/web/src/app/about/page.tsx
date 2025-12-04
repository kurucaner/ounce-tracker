import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - OunceTracker',
  description:
    'Learn about OunceTracker - an independent platform for comparing precious metal prices across trusted bullion dealers',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight">About OunceTracker</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Your trusted source for comparing precious metal prices across multiple bullion
              dealers
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                OunceTracker was created to solve a simple problem: finding the best prices on
                precious metals shouldn&apos;t require visiting dozens of dealer websites. We
                aggregate real-time pricing data from trusted bullion dealers across the United
                States, giving you a clear view of the market in one place.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Whether you&apos;re looking for gold bars, silver coins, or other precious metal
                products, we help you make informed purchasing decisions by showing you all
                available options side-by-side.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                OunceTracker is an independent price comparison platform. We continuously monitor
                prices from established bullion dealers and update our database every minute to
                ensure you have access to the most current pricing information.
              </p>
              <div className="bg-muted/50 rounded-lg p-6 my-6">
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2 text-base leading-relaxed text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>Real-time price updates:</strong> Prices refresh every minute from
                      dealer websites
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>Multiple dealers:</strong> Compare prices from 10+ trusted bullion
                      dealers
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>Product variety:</strong> Track prices for gold bars, silver coins,
                      and other precious metal products
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>Stock status:</strong> See which products are currently in stock at
                      each dealer
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>Direct links:</strong> Click through to dealer websites to complete
                      your purchase
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Independence</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                OunceTracker is completely independent. We don&apos;t sell precious metals, we
                don&apos;t receive commissions from dealers, and we don&apos;t favor any particular
                dealer in our listings. Our only goal is to provide you with accurate, unbiased
                price information.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                This independence means you can trust that the prices you see reflect the actual
                market, not our commercial interests. We believe transparency in pricing benefits
                everyone in the precious metals community.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Our automated system continuously monitors dealer websites, extracts current pricing
                information, and updates our database. This process runs 24/7, ensuring that price
                changes are reflected on OunceTracker within minutes of appearing on dealer sites.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                When you visit OunceTracker, you&apos;ll see:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-base leading-relaxed text-muted-foreground">
                <li>Current prices for each product from all available dealers</li>
                <li>Stock availability status</li>
                <li>Direct links to dealer product pages</li>
                <li>Easy comparison tools to find the best prices</li>
              </ul>
              <p className="text-base leading-relaxed text-muted-foreground">
                All transactions are completed directly with the dealers! We simply help you find
                them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Accuracy & Limitations</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                While we strive for accuracy, prices can change rapidly in the precious metals
                market. The prices displayed on OunceTracker are based on the most recent data
                available from dealer websites, but we recommend verifying current prices directly
                with dealers before making purchase decisions.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Additionally, some dealers may have minimum purchase requirements, shipping costs,
                or other terms that affect the final price. Always review dealer policies before
                completing a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-4">
                Have questions, suggestions, or found an issue with our price data? We&apos;d love
                to hear from you. Visit our{' '}
                <Link href="/contact" className="text-primary hover:underline">
                  contact page
                </Link>{' '}
                to reach out.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                You can also follow us on{' '}
                <a
                  href="https://x.com/ouncetracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  X (Twitter)
                </a>{' '}
                for updates and market insights.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
