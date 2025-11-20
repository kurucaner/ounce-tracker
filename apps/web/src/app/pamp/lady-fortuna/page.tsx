import { ExternalLink } from 'lucide-react';
import { type ProductListingsResponse, type ProductListingItem } from '@/types/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Fetch product listings from the API
 */
async function getProductListings(): Promise<ProductListingItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/pamp/lady-fortuna`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('Failed to fetch product listings:', response.statusText);
      return [];
    }

    const data: ProductListingsResponse = await response.json();

    if (!data.success) {
      console.error('API returned error:', data.error);
      return [];
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching product listings:', error);
    return [];
  }
}

/**
 * Format price with currency symbol
 */
const formatPrice = (price: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(price);
};

/**
 * Format date and time
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export default async function PampLadyFortunaPage() {
  const listings = await getProductListings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          PAMP Suisse Lady Fortuna – 1 oz Gold Bar
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Compare prices from multiple dealers
        </p>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Listings Available</CardTitle>
            <CardDescription>
              There are currently no dealer listings for this product.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Price Comparison ({listings.length} dealers)</CardTitle>
            <CardDescription>Sorted by price (lowest first)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Dealer</TableHead>
                    <TableHead className="w-[150px]">Price</TableHead>
                    <TableHead className="w-[120px]">In Stock</TableHead>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead className="w-[180px]">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing, index) => (
                    <TableRow key={`${listing.dealerSlug}-${index}`}>
                      <TableCell className="font-medium">
                        <a
                          href={`/dealers/${listing.dealerSlug}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {listing.dealerName}
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-semibold">
                          {formatPrice(listing.price, listing.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={listing.inStock ? 'success' : 'destructive'}>
                          {listing.inStock ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a
                          href={listing.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <span>View</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(listing.lastUpdated)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>
                Prices are updated regularly. Click on a dealer name to view all their products, or
                click &quot;View&quot; to go directly to the product page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
