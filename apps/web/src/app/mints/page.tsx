import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ExternalLink } from 'lucide-react';
import { MINTS } from '@/lib/mints-data';
import { memo } from 'react';

export const metadata: Metadata = {
  title: 'Trusted Mints & Manufacturers | OunceTracker',
  description:
    'Explore the world\'s most trusted precious metals mints and manufacturers. Learn about PAMP Suisse, Royal Canadian Mint, US Mint, Perth Mint, and more. Comprehensive information about quality, security features, and notable products.',
  keywords: [
    'precious metals mints',
    'PAMP Suisse',
    'Royal Canadian Mint',
    'US Mint',
    'Perth Mint',
    'Valcambi',
    'bullion manufacturers',
    'gold mints',
    'silver mints',
    'trusted refiners',
  ],
  alternates: {
    canonical: '/mints',
  },
  openGraph: {
    title: 'Trusted Mints & Manufacturers | OunceTracker',
    description:
      'Explore the world\'s most trusted precious metals mints and manufacturers.',
    url: '/mints',
    type: 'website',
  },
};

const MintCard = memo(
  ({ mint }: { mint: (typeof MINTS)[number] }) => {
    return (
      <Link href={`/mints/${mint.slug}`} className="block h-full">
        <div
          className={`group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${mint.gradient} p-[1px] backdrop-blur-xl transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl`}
        >
          {/* Glassmorphism background */}
          <div className="relative h-full rounded-2xl bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-2xl">
            {/* Animated glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground transition-colors duration-700 group-hover:text-foreground/100">
                    {mint.name}
                  </h3>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm transition-colors duration-700 group-hover:bg-white/15">
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
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground transition-colors duration-700 group-hover:text-foreground/70 sm:text-base">
                {mint.description}
              </p>

              {/* Specialties */}
              <div className="mb-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 transition-colors duration-700 group-hover:text-foreground/80">
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {mint.specialties.slice(0, 3).map((specialty, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-colors duration-700 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-foreground/100"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* View Details Link */}
              <div className="flex items-center gap-2 text-sm font-medium text-primary transition-colors duration-700 group-hover:text-primary/80">
                <span>View Details</span>
                <ExternalLink className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" />
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </Link>
    );
  }
);
MintCard.displayName = 'MintCard';

export default function MintsPage() {
  return (
    <div className="relative overflow-x-hidden bg-background">
      {/* Futuristic background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl sm:h-[500px] sm:w-[500px] lg:h-[600px] lg:w-[600px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]" />
        <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-3xl sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="mb-6 flex items-start gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Trusted Mints & Manufacturers
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                World-renowned institutions at the forefront of precious metals innovation,
                combining centuries of tradition with cutting-edge technology
              </p>
            </div>
          </div>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            We track products from the world&apos;s most reputable mints and manufacturers, each
            representing the pinnacle of quality, purity standards, and global recognition. These
            institutions set the benchmark for excellence in precious metals production.
          </p>
        </div>

        {/* Mints Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MINTS.map((mint) => (
            <MintCard key={mint.slug} mint={mint} />
          ))}
        </div>

        {/* Additional info section */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-background/60 via-background/40 to-background/60 p-8 backdrop-blur-2xl sm:p-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
              What Makes These Mints Trusted?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Certification & Assay
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Each product carries distinct hallmarks, serial numbers, and assay certificates
                  guaranteeing weight, purity, and authenticity.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Global Recognition
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Products from these mints are recognized and easily liquidated worldwide, ensuring
                  maximum liquidity for your investment.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Quality Standards
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Rigorous quality control processes ensure consistent weight, purity, and finish
                  across all products.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  Innovation
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Continuous innovation in security features, design, and manufacturing processes
                  keeps these mints at the forefront of the industry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

