'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Crown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared';
import { Badge } from '@/components/ui/badge';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { queryKeys, queryFns, queryOptions } from '@/lib/queries';

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
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.products,
    queryFn: queryFns.products,
    ...queryOptions.products,
  });

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: selectedProductId ? queryKeys.listings(selectedProductId) : ['listings'],
    queryFn: () => queryFns.listings(selectedProductId!),
    enabled: !!selectedProductId,
    ...queryOptions.listings,
  });

  // Set initial product from URL or first product
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const productIdFromUrl = searchParams.get('product');
      const initialProductId = productIdFromUrl || products[0]?.id;
      if (initialProductId) {
        setSelectedProductId(initialProductId);
      }
    }
  }, [products, searchParams, selectedProductId]);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    // Update URL with product query param
    router.push(`?product=${productId}`, { scroll: false });
  };

  const lowestPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.price)) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b bg-muted/40 px-6 py-6" aria-label="Product Selection">
          <div className="mx-auto max-w-5xl">
            {/* Product Selector */}
            <div className="mb-6">
              <label
                htmlFor="product-select"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Select Product
              </label>
              <Select value={selectedProductId || undefined} onValueChange={handleProductChange}>
                <SelectTrigger id="product-select" className="w-full max-w-md bg-background">
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8" aria-label="Price Comparison">
          {(() => {
            if (productsLoading) {
              return (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                </div>
              );
            }

            if (listingsLoading) {
              return (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Loading prices...</p>
                  </div>
                </div>
              );
            }

            if (listings.length === 0) {
              return (
                <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <p className="text-muted-foreground">No listings available for this product</p>
                  </div>
                </div>
              );
            }

            return (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-center" scope="col">
                        Dealer
                      </TableHead>
                      <TableHead className="text-center" scope="col">
                        Price
                      </TableHead>
                      <TableHead className="text-center" scope="col">
                        Stock
                      </TableHead>
                      <TableHead className="text-center" scope="col">
                        Link
                      </TableHead>
                      <TableHead className="text-center" scope="col">
                        Updated
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing, index) => {
                      const isLowest = listing.price === lowestPrice;
                      const priceDifference = listing.price - lowestPrice;
                      return (
                        <TableRow key={`${listing.dealerSlug}-${index}`}>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              {isLowest && <Crown className="h-4 w-4 text-yellow-500" />}
                              <Link
                                href={listing.dealerWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sm text-blue-900 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {listing.dealerName}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-lg font-semibold">
                                {formatPrice(listing.price)}
                              </span>
                              {!isLowest && priceDifference > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  +{formatPrice(priceDifference)} more
                                </span>
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
            );
          })()}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
