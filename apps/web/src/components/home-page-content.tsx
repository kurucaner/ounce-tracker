'use client';

import { useState, useEffect, Suspense } from 'react';
import { ExternalLink, TrendingDown } from 'lucide-react';
import { type ProductListingItem } from '@/types/database';
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

interface Product {
  id: string;
  name: string;
  mint: string;
  metal: string;
  form: string;
  weight_oz: number;
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
  console.log('foo');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [listings, setListings] = useState<ProductListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Fetch all products on mount
  //   useEffect(() => {
  //     console.log('boo');
  //     const fetchProducts = async () => {
  //       try {
  //         const response = await fetch('/api/products');
  //         const data = await response.json();
  //         if (data.success && data.products.length > 0) {
  //           setProducts(data.products);

  //           // Set initial product from URL or first product
  //           const productIdFromUrl = searchParams.get('product');
  //           const initialProductId = productIdFromUrl || data.products[0].id;
  //           setSelectedProductId(initialProductId);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching products:', error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchProducts();
  //   }, [searchParams]);

  // Fetch listings when product changes
  useEffect(() => {
    if (!selectedProductId) return;

    const fetchListings = async () => {
      setListingsLoading(true);
      try {
        const response = await fetch(`/api/listings?productId=${selectedProductId}`);
        const data = await response.json();
        if (data.success) {
          setListings(data.data);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setListingsLoading(false);
      }
    };

    fetchListings();
  }, [selectedProductId]);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    // Update URL with product query param
    router.push(`?product=${productId}`, { scroll: false });
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const lowestPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.price)) : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b bg-muted/40 px-6 py-6">
          <div className="mx-auto max-w-5xl">
            {/* Product Selector */}
            <div className="mb-6">
              <label
                htmlFor="product-select"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Select Product
              </label>
              <Select value={selectedProductId} onValueChange={handleProductChange}>
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

            {/* Product Title and Best Price */}
            {selectedProduct && (
              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight">{selectedProduct.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.mint} • {selectedProduct.weight_oz} oz{' '}
                  {selectedProduct.metal.charAt(0).toUpperCase() + selectedProduct.metal.slice(1)}
                </p>
              </div>
            )}

            {lowestPrice > 0 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground">Best Price</div>
                <div className="text-3xl font-bold">{formatPrice(lowestPrice)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-8">
          {(() => {
            if (loading) {
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
                          <TableCell className="text-center">
                            <Link
                              href={listing.dealerWebsiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {listing.dealerName}
                            </Link>
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
            );
          })()}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
