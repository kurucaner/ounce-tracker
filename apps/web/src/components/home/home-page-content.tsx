'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Trophy, Award, Medal } from 'lucide-react';
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

/**
 * Interpolate color from gold (lowest price) to dark green (highest price)
 * @param position 0 (lowest price) to 1 (highest price)
 * @returns RGB color string
 */
const getPriceGradientColor = (position: number): string => {
  // Clamp position between 0 and 1
  const clampedPosition = Math.max(0, Math.min(1, position));

  // Color stops: Gold → Light Green → Dark Green
  // Gold: rgb(234, 179, 8) - #eab308
  // Light Green: rgb(74, 222, 128) - #4ade80
  // Dark Green: rgb(22, 101, 52) - #166534

  let r: number, g: number, b: number;

  if (clampedPosition < 0.5) {
    // Interpolate between Gold and Light Green (0 to 0.5)
    const t = clampedPosition * 2; // 0 to 1 for this segment
    r = Math.round(234 + (74 - 234) * t);
    g = Math.round(179 + (222 - 179) * t);
    b = Math.round(8 + (128 - 8) * t);
  } else {
    // Interpolate between Light Green and Dark Green (0.5 to 1)
    const t = (clampedPosition - 0.5) * 2; // 0 to 1 for this segment
    r = Math.round(74 + (22 - 74) * t);
    g = Math.round(222 + (101 - 222) * t);
    b = Math.round(128 + (52 - 128) * t);
  }

  return `rgb(${r}, ${g}, ${b})`;
};

export function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.products,
    queryFn: queryFns.products,
    ...queryOptions.products,
  });

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: selectedProductId ? queryKeys.listings(selectedProductId) : ['listings'],
    queryFn: () => queryFns.listings(selectedProductId),
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

  // Filter to only in-stock items for price range and ranking calculations
  const inStockListings = listings.filter((l) => l.inStock);
  const lowestPrice =
    inStockListings.length > 0 ? Math.min(...inStockListings.map((l) => l.price)) : 0;
  const highestPrice =
    inStockListings.length > 0 ? Math.max(...inStockListings.map((l) => l.price)) : 0;

  // Sort in-stock listings by price to determine rankings
  const sortedInStockListings = [...inStockListings].sort((a, b) => a.price - b.price);
  const prices = sortedInStockListings.map((l) => l.price);
  const uniquePrices = Array.from(new Set(prices)).sort((a, b) => a - b);

  // Determine rank for each listing (only for in-stock items)
  const getRank = (price: number, inStock: boolean): number | null => {
    if (!inStock) return null;
    const index = uniquePrices.indexOf(price);
    return index >= 0 && index < 3 ? index + 1 : null;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section
          className="border-b bg-muted/40 px-4 py-4 sm:px-6 sm:py-6"
          aria-label="Product Selection"
        >
          <div className="mx-auto max-w-5xl">
            {/* Product Selector */}
            <div>
              <label
                htmlFor="product-select"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Select Product
              </label>
              <Select value={selectedProductId} onValueChange={handleProductChange}>
                <SelectTrigger id="product-select" className="w-full bg-background sm:max-w-md">
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

        <section
          className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
          aria-label="Price Comparison"
        >
          {(() => {
            if (productsLoading) {
              return (
                <div className="flex h-[300px] items-center justify-center sm:h-[400px]">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground sm:text-base">Loading dealers...</p>
                  </div>
                </div>
              );
            }

            if (listingsLoading) {
              return (
                <div className="flex h-[300px] items-center justify-center sm:h-[400px]">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground sm:text-base">Loading prices...</p>
                  </div>
                </div>
              );
            }

            if (listings.length === 0) {
              return (
                <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed sm:h-[400px]">
                  <div className="text-center px-4">
                    <p className="text-sm text-muted-foreground sm:text-base">
                      No listings available for this product
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-base font-semibold sm:text-lg">Price Comparison</h2>
                  <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                    {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
                  </Badge>
                </div>

                {/* Mobile Card Layout */}
                <div className="space-y-3 md:hidden">
                  {listings.map((listing, index) => {
                    const isLowest = listing.inStock && listing.price === lowestPrice;
                    const priceDifference = listing.inStock ? listing.price - lowestPrice : 0;
                    const rank = getRank(listing.price, listing.inStock);

                    // Calculate gradient position (0 = lowest price, 1 = highest price)
                    const priceRange = highestPrice - lowestPrice;
                    const gradientPosition =
                      priceRange > 0 ? (listing.price - lowestPrice) / priceRange : 0;
                    const priceColor = listing.inStock
                      ? getPriceGradientColor(gradientPosition)
                      : 'rgb(156, 163, 175)'; // gray-400 for out of stock

                    // Render icon based on rank
                    const renderRankIcon = () => {
                      if (rank === 1) {
                        return <Trophy className="h-4 w-4 shrink-0 text-yellow-500" />;
                      }
                      if (rank === 2) {
                        return <Award className="h-4 w-4 shrink-0 text-gray-400" />;
                      }
                      if (rank === 3) {
                        return <Medal className="h-4 w-4 shrink-0 text-amber-600" />;
                      }
                      return null;
                    };

                    return (
                      <div
                        key={`${listing.dealerSlug}-${index}`}
                        className="rounded-lg border bg-card p-4 shadow-sm"
                      >
                        <div className="space-y-3">
                          {/* Dealer and Price Row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              {renderRankIcon()}
                              <Link
                                href={listing.dealerWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate font-medium text-sm text-blue-900 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {listing.dealerName}
                              </Link>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                              <span className="text-lg font-semibold" style={{ color: priceColor }}>
                                {formatPrice(listing.price)}
                              </span>
                              {!isLowest && priceDifference > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  +{formatPrice(priceDifference)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stock, Link, and Updated Row */}
                          <div className="flex items-center justify-between gap-2 border-t pt-2">
                            <Badge
                              variant={listing.inStock ? 'success' : 'secondary'}
                              className="whitespace-nowrap text-xs"
                            >
                              {listing.inStock ? 'In Stock' : 'Out'}
                            </Badge>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatTime(listing.updatedAt)}</span>
                              <a
                                href={listing.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:text-foreground"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden rounded-lg border md:block">
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
                        const isLowest = listing.inStock && listing.price === lowestPrice;
                        const priceDifference = listing.inStock ? listing.price - lowestPrice : 0;
                        const rank = getRank(listing.price, listing.inStock);

                        // Calculate gradient position (0 = lowest price, 1 = highest price)
                        const priceRange = highestPrice - lowestPrice;
                        const gradientPosition =
                          priceRange > 0 ? (listing.price - lowestPrice) / priceRange : 0;
                        const priceColor = listing.inStock
                          ? getPriceGradientColor(gradientPosition)
                          : 'rgb(156, 163, 175)'; // gray-400 for out of stock

                        // Render icon based on rank
                        const renderRankIcon = () => {
                          if (rank === 1) {
                            return <Trophy className="h-4 w-4 text-yellow-500" />;
                          }
                          if (rank === 2) {
                            return <Award className="h-4 w-4 text-gray-400" />;
                          }
                          if (rank === 3) {
                            return <Medal className="h-4 w-4 text-amber-600" />;
                          }
                          return null;
                        };

                        return (
                          <TableRow key={`${listing.dealerSlug}-${index}`}>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {renderRankIcon()}
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
                                <span
                                  className="text-lg font-semibold"
                                  style={{ color: priceColor }}
                                >
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
                                  className="whitespace-nowrap text-xs"
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
              </div>
            );
          })()}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
