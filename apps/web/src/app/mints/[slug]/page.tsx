import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Globe, Shield, Sparkles, Award } from 'lucide-react';
import { MINTS, getMintBySlug, getAllMintSlugs } from '@/lib/mints-data';
import { Card, CardContent } from '@shared';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllMintSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mint = getMintBySlug(slug);

  if (!mint) {
    return {
      title: 'Mint Not Found | OunceTracker',
    };
  }

  return {
    title: `${mint.name} - Trusted Precious Metals Mint | OunceTracker`,
    description: mint.fullDescription || mint.description,
    keywords: [
      mint.name,
      `${mint.name} precious metals`,
      `${mint.name} gold`,
      `${mint.name} silver`,
      ...mint.notableProducts,
      mint.country,
      'bullion',
      'precious metals',
    ],
    alternates: {
      canonical: `/mints/${slug}`,
    },
    openGraph: {
      title: `${mint.name} - Trusted Precious Metals Mint`,
      description: mint.fullDescription || mint.description,
      url: `/mints/${slug}`,
      type: 'article',
    },
  };
}

export default async function MintDetailPage({ params }: Props) {
  const { slug } = await params;
  const mint = getMintBySlug(slug);

  if (!mint) {
    notFound();
  }

  return (
    <div className="relative overflow-x-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl sm:h-[500px] sm:w-[500px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl sm:h-[400px] sm:w-[400px]" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Back link */}
        <Link
          href="/mints"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Mints</span>
        </Link>

        {/* Header */}
        <div
          className={`mb-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${mint.gradient} p-[1px] backdrop-blur-xl`}
        >
          <div className="rounded-3xl bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-8 backdrop-blur-2xl sm:p-12">
            <div className="mb-6 flex items-start gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <Building2 className="h-8 w-8 text-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{mint.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {mint.country}
                    </span>
                  </div>
                  {mint.founded && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        Founded {mint.founded}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm font-semibold text-foreground">
                    {mint.purity} Purity
                  </span>
                </div>
              </div>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {mint.fullDescription || mint.description}
            </p>
            {mint.website && (
              <a
                href={mint.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                <Globe className="h-4 w-4" />
                <span>Visit Official Website</span>
              </a>
            )}
          </div>
        </div>

        {/* Specialties */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Specialties</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {mint.specialties.map((specialty, idx) => (
              <span
                key={idx}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </section>

        {/* History */}
        {mint.history && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">History</h2>
            </div>
            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6 sm:p-8">
                <p className="text-base leading-relaxed text-muted-foreground">{mint.history}</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Notable Products */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Notable Products</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mint.notableProducts.map((product, idx) => (
              <Card key={idx} className="border border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    <span className="text-base font-medium text-foreground">{product}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Series */}
        {mint.popularSeries && mint.popularSeries.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Popular Series</h2>
            </div>
            <div className="space-y-6">
              {mint.popularSeries.map((series, idx) => (
                <Card key={idx} className="border border-border/50 bg-card">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="mb-3 text-lg font-semibold">{series.name}</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {series.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Security Features */}
        {mint.securityFeatures && mint.securityFeatures.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Security Features</h2>
            </div>
            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6 sm:p-8">
                <ul className="space-y-3">
                  {mint.securityFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-base leading-relaxed text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Related Mints */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Explore Other Mints</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MINTS.filter((m) => m.slug !== slug)
              .slice(0, 3)
              .map((relatedMint) => (
                <Link
                  key={relatedMint.slug}
                  href={`/mints/${relatedMint.slug}`}
                  className="group block"
                >
                  <Card className="h-full border border-border/50 bg-card transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
                        {relatedMint.name}
                      </h3>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {relatedMint.country}
                        {relatedMint.founded && ` • ${relatedMint.founded}`}
                      </p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {relatedMint.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

