'use client';

import { memo } from 'react';
import { Coins, Building2, TrendingUp, Shield, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared';

const MintCard = memo(
  ({ name, country, description }: { name: string; country: string; description: string }) => {
    return (
      <Card className="group relative h-full overflow-hidden border border-border/50 bg-card transition-all duration-500 hover:border-primary/20 hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <CardHeader className="relative z-10">
          <div className="mb-2">
            <CardTitle className="text-lg font-semibold leading-tight">{name}</CardTitle>
            <CardDescription className="mt-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {country}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
  }
);
MintCard.displayName = 'MintCard';

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

export function InformativeSections() {
  return (
    <div className="relative border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Why Gold & Silver Matter */}
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

        {/* Section Divider */}
        <div className="my-20 flex items-center gap-4 sm:my-28">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Trusted Mints */}
        <section className="mb-24 sm:mb-32" aria-label="Trusted Mints & Manufacturers">
          <SectionHeader
            title="Trusted Mints & Manufacturers"
            subtitle="World-renowned institutions guaranteeing quality, purity, and authenticity"
            icon={Building2}
          />
          <p className="mb-10 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We track products from the world&apos;s most reputable mints and manufacturers, known
            for their quality, purity standards, and global recognition.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MintCard
              name="PAMP Suisse"
              country="Switzerland"
              description="One of the world's leading precious metals refiners, known for the Lady Fortuna design and exceptional quality."
            />
            <MintCard
              name="Royal Canadian Mint"
              country="Canada"
              description="Government-owned mint producing the iconic Maple Leaf coins with 99.99% purity guarantees."
            />
            <MintCard
              name="US Mint"
              country="United States"
              description="Official mint of the United States, producing American Eagle and American Buffalo coins."
            />
            <MintCard
              name="Perth Mint"
              country="Australia"
              description="Government-backed mint producing the Australian Kangaroo and other highly sought-after products."
            />
            <MintCard
              name="Valcambi"
              country="Switzerland"
              description="Premium refiner producing Combibars and other innovative precious metal products."
            />
            <MintCard
              name="Other Reputable Mints"
              country="Global"
              description="We also track products from other trusted mints including Credit Suisse, Johnson Matthey, and more."
            />
          </div>
        </section>

        {/* Section Divider */}
        <div className="my-20 flex items-center gap-4 sm:my-28">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Economic Role */}
        <section className="mb-24 sm:mb-32" aria-label="The Economic Role of Precious Metals">
          <SectionHeader
            title="The Economic Role of Precious Metals"
            subtitle="Understanding their impact on global markets and economies"
            icon={TrendingUp}
          />
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              Precious metals play a crucial role in the global economy. Central banks around the
              world hold significant gold reserves as a store of value and a hedge against economic
              uncertainty. Gold has historically served as a safe haven asset during times of
              inflation, currency crises, and geopolitical instability.
            </p>
            <p>
              Silver, while also a monetary metal, has extensive industrial applications in
              electronics, solar panels, medical equipment, and more. This dual nature—both monetary
              and industrial—creates unique supply and demand dynamics that influence pricing.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold">Market Indicators</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Precious metal prices often reflect broader economic conditions, making them
                  valuable indicators for investors and economists.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold">Industrial Demand</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Silver&apos;s industrial applications create steady demand, while gold&apos;s use
                  in technology and jewelry supports long-term value.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Divider */}
        <div className="my-20 flex items-center gap-4 sm:my-28">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Understanding Bullion Pricing - Accordion FAQ */}
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
                    metal. It&apos;s the base price before any dealer premiums are added. Spot
                    prices fluctuate throughout the day based on global supply and demand.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="price-variation">
                  <AccordionTrigger className="px-6 py-5 text-left font-semibold">
                    Why do prices vary between dealers?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                    Dealers add premiums to the spot price to cover their costs, overhead, and
                    profit margins. Premiums can vary based on product type, dealer size, inventory
                    levels, and market conditions. Smaller products typically have higher premiums
                    per ounce than larger bars.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="price-factors">
                  <AccordionTrigger className="px-6 py-5 text-left font-semibold">
                    What factors affect bullion prices?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                    Several factors influence bullion prices: global economic conditions, inflation
                    expectations, currency strength, central bank policies, geopolitical events,
                    industrial demand (especially for silver), mining supply, and investor
                    sentiment. These factors create the dynamic pricing you see in our comparison
                    tool.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="price-updates">
                  <AccordionTrigger className="px-6 py-5 text-left font-semibold">
                    How often are prices updated?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                    Our prices are updated in real-time as dealers update their websites. We
                    continuously monitor dealer listings to ensure you have access to the most
                    current pricing information available.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Section Divider */}
        <div className="my-20 flex items-center gap-4 sm:my-28">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* About OunceTracker */}
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
                  affiliations with any dealers. Our mission is to provide transparent, unbiased
                  price comparisons to help you make informed purchasing decisions.
                </p>
              </CardContent>
            </Card>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border border-border/50 bg-card">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">Real-Time Data</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We continuously monitor dealer websites and update prices as they change,
                    ensuring you always have access to current market pricing.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border/50 bg-card">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">Accuracy First</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Our commitment is to provide accurate, reliable price information. We verify
                    data from multiple sources and update our systems regularly.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-border/50 bg-card">
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">Comprehensive Coverage</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We track prices from multiple trusted bullion dealers, giving you a
                    comprehensive view of the market in one convenient location.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
