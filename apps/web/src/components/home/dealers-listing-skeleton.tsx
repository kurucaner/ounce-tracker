import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared';

export function DealersListingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Product Selector Skeleton */}
        <section
          className="border-b bg-muted/40 px-4 py-4 sm:px-6 sm:py-6"
          aria-label="Product Selection"
        >
          <div className="mx-auto max-w-5xl">
            <div>
              <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </section>

        {/* Price Comparison Skeleton */}
        <section
          className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"
          aria-label="Price Comparison"
        >
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Mobile Card Layout Skeleton */}
            <div className="space-y-3 md:hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t pt-2">
                      <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout Skeleton */}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

