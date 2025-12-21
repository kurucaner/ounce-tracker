'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Coins, Building2, TrendingUp, Shield, Sparkles, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared';
import { MINTS } from '@/lib/mints-data';

const FeatureCard = memo(({ title, description }: { title: string; description: string }) => {
  return (
    <Card className="group relative h-full overflow-hidden border border-border/50 bg-card transition-all duration-500 hover:border-primary/20 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
});
FeatureCard.displayName = 'FeatureCard';

const SectionHeader = memo(
  ({
    title,
    subtitle,
    icon: Icon,
  }: {
    title: string;
    subtitle?: string;
    icon: React.ElementType;
  }) => {
    return (
      <div className="mb-12 sm:mb-16">
        <div className="mb-6 flex items-start gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            {subtitle && (
              <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';

const WhyGoldAndSilverMatter = () => {
  return (
    <section className="mb-24 sm:mb-32" aria-label="Why Gold & Silver Matter">
      <SectionHeader
        title="Why Gold & Silver Matter"
        subtitle="Timeless wealth preservation through precious metals that have stood the test of time"
        icon={Coins}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Store of Value"
          description="Precious metals have maintained their purchasing power for thousands of years, serving as a reliable hedge against inflation and currency devaluation."
        />
        <FeatureCard
          title="Portfolio Diversification"
          description="Gold and silver often move independently of stocks and bonds, providing diversification benefits and reducing overall portfolio risk."
        />
        <FeatureCard
          title="Tangible Asset"
          description="Unlike digital assets or paper investments, physical precious metals are tangible assets you can hold, providing security and peace of mind."
        />
      </div>
    </section>
  );
};

const TrustedMintsAndManufacturers = () => {
  return (
    <section
      className="relative mb-24 sm:mb-32 overflow-hidden"
      aria-label="Trusted Mints & Manufacturers"
    >
      {/* Futuristic background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl sm:h-[500px] sm:w-[500px] lg:h-[600px] lg:w-[600px]" />
        <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]" />
        <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-3xl sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]" />
      </div>

      <div className="relative">
        <SectionHeader
          title="Trusted Mints & Manufacturers"
          subtitle="World-renowned institutions at the forefront of precious metals innovation"
          icon={Building2}
        />
        <p className="mb-8 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We track products from the world&apos;s most reputable mints and manufacturers, each
          representing the pinnacle of quality, purity standards, and global recognition.
        </p>

        {/* Featured Mints Preview - Just 3 */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          {MINTS.slice(0, 3).map((mint) => (
            <Link key={mint.name} href="/mints" className="block">
              <Card className="group h-full overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                      {mint.name}
                    </h3>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                      {mint.purity}
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{mint.country}</span>
                    {mint.founded && (
                      <>
                        <span>•</span>
                        <span className="text-xs">{mint.founded}</span>
                      </>
                    )}
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {mint.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Prominent CTA */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 text-center backdrop-blur-sm sm:p-12">
          <h3 className="mb-3 text-2xl font-bold sm:text-3xl">
            Explore All {MINTS.length} Trusted Mints
          </h3>
          <p className="mb-6 mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Learn about each mint&apos;s history, security features, popular series, and what makes
            them leaders in precious metals production.
          </p>
          <Link
            href="/mints"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
          >
            <span>View All Mints</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const TheEconomicRoleOfPreciousMetals = () => {
  return (
    <section className="mb-24 sm:mb-32" aria-label="The Economic Role of Precious Metals">
      <SectionHeader
        title="The Economic Role of Precious Metals"
        subtitle="Understanding their impact on global markets and economies"
        icon={TrendingUp}
      />
      <div className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
        <p>
          Precious metals play a crucial role in the global economy. Central banks around the world
          hold significant gold reserves as a store of value and a hedge against economic
          uncertainty. Gold has historically served as a safe haven asset during times of inflation,
          currency crises, and geopolitical instability.
        </p>
        <p>
          Silver, while also a monetary metal, has extensive industrial applications in electronics,
          solar panels, medical equipment, and more. This dual nature and both monetary and
          industrial and creates unique supply and demand dynamics that influence pricing.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Card className="border border-border/50 bg-card">
          <CardContent className="p-6">
            <h3 className="mb-3 text-lg font-semibold">Market Indicators</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Precious metal prices often reflect broader economic conditions, making them valuable
              indicators for investors and economists.
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 bg-card">
          <CardContent className="p-6">
            <h3 className="mb-3 text-lg font-semibold">Industrial Demand</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Silver&apos;s industrial applications create steady demand, while gold&apos;s use in
              technology and jewelry supports long-term value.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const UnderstandingBullionPricing = () => {
  return (
    <section className="mb-24 sm:mb-32" aria-label="Understanding Bullion Pricing">
      <SectionHeader
        title="Understanding Bullion Pricing"
        subtitle="Essential knowledge for informed purchasing decisions"
        icon={Sparkles}
      />
      <Card className="border border-border/50 bg-card">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="spot-price">
              <AccordionTrigger className="px-6 py-5 text-left font-semibold">
                What is the spot price?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                The spot price is the current market price for immediate delivery of a precious
                metal. It&apos;s the base price before any dealer premiums are added. Spot prices
                fluctuate throughout the day based on global supply and demand.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price-variation">
              <AccordionTrigger className="px-6 py-5 text-left font-semibold">
                Why do prices vary between dealers?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                Dealers add premiums to the spot price to cover their costs, overhead, and profit
                margins. Premiums can vary based on product type, dealer size, inventory levels, and
                market conditions. Smaller products typically have higher premiums per ounce than
                larger bars.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price-factors">
              <AccordionTrigger className="px-6 py-5 text-left font-semibold">
                What factors affect bullion prices?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                Several factors influence bullion prices: global economic conditions, inflation
                expectations, currency strength, central bank policies, geopolitical events,
                industrial demand (especially for silver), mining supply, and investor sentiment.
                These factors create the dynamic pricing you see in our comparison tool.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="price-updates">
              <AccordionTrigger className="px-6 py-5 text-left font-semibold">
                How often are prices updated?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                Our prices are updated in real-time as dealers update their websites. We
                continuously monitor dealer listings to ensure you have access to the most current
                pricing information available.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
};

const AboutOunceTracker = () => {
  return (
    <section className="mb-8" aria-label="About OunceTracker">
      <SectionHeader
        title="Why Trust OunceTracker"
        subtitle="Transparency, accuracy, and independence you can rely on"
        icon={Shield}
      />
      <div className="space-y-8">
        <Card className="border border-border/50 bg-card">
          <CardContent className="p-8">
            <h3 className="mb-4 text-xl font-semibold">Independent Price Comparison</h3>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              OunceTracker is an independent platform. We don&apos;t sell bullion or have
              affiliations with any dealers. Our mission is to provide transparent, unbiased price
              comparisons to help you make informed purchasing decisions.
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-border/50 bg-card">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Real-Time Data</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We continuously monitor dealer websites and update prices as they change, ensuring
                you always have access to current market pricing.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border/50 bg-card">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Accuracy First</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our commitment is to provide accurate, reliable price information. We verify data
                from multiple sources and update our systems regularly.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border/50 bg-card">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Comprehensive Coverage</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We track prices from multiple trusted bullion dealers, giving you a comprehensive
                view of the market in one convenient location.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const SectionDivider = () => {
  return (
    <div className="my-20 flex items-center gap-4 sm:my-28">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export function InformativeSections() {
  return (
    <div className="relative border-t border-border bg-background overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <WhyGoldAndSilverMatter />

        <SectionDivider />

        <TrustedMintsAndManufacturers />

        <SectionDivider />

        <TheEconomicRoleOfPreciousMetals />

        <SectionDivider />

        <UnderstandingBullionPricing />

        <SectionDivider />

        <AboutOunceTracker />
      </div>
    </div>
  );
}
