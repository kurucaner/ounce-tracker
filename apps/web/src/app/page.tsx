import { HomePageContent } from '@/components/home-page-content';
import { Suspense } from 'react';

export default async function HomePage() {
  const products = await fetch('/api/products');
  const productsData = await products.json();

  console.log('productsData', productsData);

  if (!productsData.success) {
    return <div>Error: {productsData.error}</div>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
