'use client';

import { memo } from 'react';
import { Coins, Building2, TrendingUp, Shield, Sparkles, ShoppingBag } from 'lucide-react';
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

interface MintDetails {
  name: string;
  country: string;
  founded?: string;
  purity: string;
  specialties: string[];
  notableProducts: string[];
  description: string;
  gradient: string;
}

const FuturisticMintCard = memo(({ mint }: { mint: MintDetails }) => {
  return (
    <div className="p-1">
      <div
        className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${mint.gradient} p-[1px] backdrop-blur-xl transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl`}
      >
        {/* Glassmorphism background */}
        <div className="relative h-full rounded-2xl bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-2xl">
          {/* Animated glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight text-foreground transition-colors duration-700 group-hover:text-foreground/100">
                  {mint.name}
                </h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm transition-colors duration-700 group-hover:bg-white/15">
                  <span className="text-xs font-bold text-foreground transition-colors duration-700 group-hover:text-foreground/100">
                    {mint.purity}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-700 group-hover:bg-cyan-400 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground transition-colors duration-700 group-hover:text-foreground/80">
                  {mint.country}
                </span>
                {mint.founded && (
                  <>
                    <span className="text-muted-foreground transition-colors duration-700 group-hover:text-foreground/60">
                      •
                    </span>
                    <span className="text-xs text-muted-foreground transition-colors duration-700 group-hover:text-foreground/70">
                      {mint.founded}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground transition-colors duration-700 group-hover:text-foreground/70 sm:text-base">
              {mint.description}
            </p>

            {/* Specialties */}
            <div className="mb-6 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 transition-colors duration-700 group-hover:text-foreground/80">
                Specialties
              </h4>
              <div className="flex flex-wrap gap-2">
                {mint.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-colors duration-700 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-foreground/100"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Notable Products */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 transition-colors duration-700 group-hover:text-foreground/80">
                Notable Products
              </h4>
              <ul className="space-y-1.5">
                {mint.notableProducts.map((product, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-700 group-hover:text-foreground/70"
                  >
                    <div className="h-1 w-1 rounded-full bg-cyan-400/60 transition-all duration-700 group-hover:bg-cyan-400" />
                    <span>{product}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </div>
  );
});
FuturisticMintCard.displayName = 'FuturisticMintCard';

const MINTS: MintDetails[] = [
  {
    name: 'PAMP Suisse',
    country: 'Switzerland',
    founded: '1977',
    purity: '99.99%',
    specialties: ['Refining', 'Design Innovation', 'Certification'],
    notableProducts: [
      'Lady Fortuna Series',
      'Fortuna Gold Bars',
      'CertiPAMP Bars',
      'InGold Series',
    ],
    description:
      "One of the world's leading precious metals refiners, PAMP Suisse combines Swiss precision with artistic excellence. Known for their iconic Lady Fortuna design and innovative CertiPAMP technology, they set industry standards for quality and authenticity.",
    gradient: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
  },
  {
    name: 'Royal Canadian Mint',
    country: 'Canada',
    founded: '1908',
    purity: '99.99%',
    specialties: ['Government Backing', 'Maple Leaf Series', 'Security Features'],
    notableProducts: [
      'Gold Maple Leaf',
      'Silver Maple Leaf',
      'Platinum Maple Leaf',
      'Palladium Maple Leaf',
    ],
    description:
      "As a Crown corporation of Canada, the Royal Canadian Mint produces some of the world's most recognized bullion coins. Their Maple Leaf series features advanced security features and is backed by the Canadian government, ensuring exceptional quality and liquidity.",
    gradient: 'from-blue-500/20 via-indigo-500/20 to-blue-500/20',
  },
  {
    name: 'US Mint',
    country: 'United States',
    founded: '1792',
    purity: '99.99%',
    specialties: ['Legal Tender', 'Eagle Series', 'Buffalo Series'],
    notableProducts: [
      'American Gold Eagle',
      'American Silver Eagle',
      'American Buffalo',
      'Platinum Eagle',
    ],
    description:
      'The official mint of the United States, established by Congress in 1792. Produces legal tender bullion coins including the iconic American Eagle and American Buffalo series. These coins are recognized worldwide and carry the full faith and credit of the U.S. government.',
    gradient: 'from-purple-500/20 via-violet-500/20 to-purple-500/20',
  },
  {
    name: 'Perth Mint',
    country: 'Australia',
    founded: '1899',
    purity: '99.99%',
    specialties: ['Kangaroo Series', 'Lunar Series', 'Government Backing'],
    notableProducts: ['Australian Kangaroo', 'Australian Koala', 'Lunar Series', 'Perth Mint Bars'],
    description:
      "Australia's oldest operating mint and a government enterprise of Western Australia. Known for innovative designs and the popular Kangaroo and Lunar series. Perth Mint products are backed by the Western Australian government and recognized globally for quality.",
    gradient: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
  },
  {
    name: 'Valcambi',
    country: 'Switzerland',
    founded: '1961',
    purity: '99.99%',
    specialties: ['Combibars', 'Innovation', 'Swiss Quality'],
    notableProducts: ['Combibar Technology', 'Valcambi Gold Bars', 'Silver Bars', 'Platinum Bars'],
    description:
      'A premium Swiss refiner known for revolutionary products like the Combibar—a bar that can be broken into smaller units while maintaining individual assay certification. Valcambi combines Swiss precision with innovative design, making them a leader in flexible precious metals products.',
    gradient: 'from-amber-500/20 via-orange-500/20 to-amber-500/20',
  },
  {
    name: 'Other Reputable Mints',
    country: 'Global',
    purity: '99.9%+',
    specialties: ['Diversity', 'Global Recognition', 'Quality Standards'],
    notableProducts: ['Credit Suisse Bars', 'Johnson Matthey', 'Heraeus', 'Argor-Heraeus'],
    description:
      'We also track products from other trusted mints and refiners including Credit Suisse, Johnson Matthey, Heraeus, Argor-Heraeus, and more. Each maintains rigorous quality standards and global recognition, ensuring your investment meets the highest industry benchmarks.',
    gradient: 'from-slate-500/20 via-gray-500/20 to-slate-500/20',
  },
];

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
          subtitle="World-renowned institutions at the forefront of precious metals innovation, combining centuries of tradition with cutting-edge technology"
          icon={Building2}
        />
        <p className="mb-12 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We track products from the world&apos;s most reputable mints and manufacturers, each
          representing the pinnacle of quality, purity standards, and global recognition. These
          institutions set the benchmark for excellence in precious metals production.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MINTS.map((mint) => (
            <FuturisticMintCard key={mint.name} mint={mint} />
          ))}
        </div>

        {/* Additional info section */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-background/60 via-background/40 to-background/60 p-8 backdrop-blur-2xl sm:p-10">
          <div className="mx-auto max-w-3xl">
            <h3 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
              What Makes These Mints Trusted?
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Certification & Assay
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Each product carries distinct hallmarks, serial numbers, and assay certificates
                  guaranteeing weight, purity, and authenticity.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Global Recognition
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Products from these mints are recognized and easily liquidated worldwide, ensuring
                  maximum liquidity for your investment.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Quality Standards
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Rigorous quality control processes ensure consistent weight, purity, and finish
                  across all products.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Innovation
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Continuous innovation in security features, design, and manufacturing processes
                  keeps these mints at the forefront of the industry.
                </p>
              </div>
            </div>
          </div>
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
          solar panels, medical equipment, and more. This dual nature—both monetary and
          industrial—creates unique supply and demand dynamics that influence pricing.
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
        <Card className="group relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 transition-all duration-500 hover:border-primary/40 hover:shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">Visit Our Store</h3>
                <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Ready to purchase? Visit our Shopify store to browse and buy premium precious
                  metals from trusted dealers.
                </p>
                <a
                  href="https://shop.ouncetracker.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Open Store
                </a>
              </div>
            </div>
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
