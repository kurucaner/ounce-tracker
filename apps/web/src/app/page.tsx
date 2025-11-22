import {
  Metal,
  formatPrice,
  getMetalDisplayName,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared';

export default function Home() {
  // Example usage of shared types and utilities
  const metals = [Metal.GOLD, Metal.SILVER, Metal.PLATINUM, Metal.PALLADIUM];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">OunceTracker</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Bullion Price Comparison Platform
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Compare precious metal prices across multiple dealers in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metals.map((metal) => (
            <Card key={metal} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{getMetalDisplayName(metal)}</CardTitle>
                <CardDescription>Spot Price</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(0)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">per troy ounce</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Welcome to OunceTracker</CardTitle>
              <CardDescription>Your complete solution for tracking bullion prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                This platform helps you compare prices for gold, silver, platinum, and palladium
                products from multiple dealers.
              </p>
              <div className="flex justify-center gap-4">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js 15, Bun, and TypeScript in a monorepo architecture</p>
        </div>
      </div>
    </main>
  );
}
