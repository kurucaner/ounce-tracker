import { ExternalLink, TrendingDown } from 'lucide-react';
import { type ProductListingsResponse, type ProductListingItem } from '@/types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

async function getProductListings(): Promise<ProductListingItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/pamp/lady-fortuna`, {
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const data: ProductListingsResponse = await response.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
};

export default async function PampLadyFortunaPage() {
  const listings = await getProductListings();
  const lowestPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.price)) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b bg-muted/40 px-6 py-6">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">PAMP Lady Fortuna 1oz Gold</h1>
              <p className="text-sm text-muted-foreground">Live dealer prices</p>
            </div>
            {lowestPrice > 0 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground">Best Price</div>
                <div className="text-3xl font-bold">{formatPrice(lowestPrice)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-8">
          {listings.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground">No listings available</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-center">Dealer</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Link</TableHead>
                    <TableHead className="text-center">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing, index) => {
                    const isLowest = listing.price === lowestPrice;
                    return (
                      <TableRow key={`${listing.dealerSlug}-${index}`}>
                        <TableCell className="text-center font-medium">
                          {listing.dealerName}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-semibold">
                              {formatPrice(listing.price)}
                            </span>
                            {isLowest && (
                              <Badge variant="default" className="text-xs">
                                <TrendingDown className="mr-1 h-3 w-3" />
                                Lowest
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Badge
                              variant={listing.inStock ? 'success' : 'secondary'}
                              className="text-xs"
                            >
                              {listing.inStock ? 'In Stock' : 'Out'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <a
                            href={listing.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {formatTime(listing.updatedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
