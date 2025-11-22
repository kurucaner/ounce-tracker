import Link from 'next/link';
import { Store, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@shared';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage dealers and products</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <Store className="h-8 w-8 mb-2" />
            <CardTitle>Dealers</CardTitle>
            <CardDescription>Manage bullion dealers</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dealers">
              <Button className="w-full">Manage Dealers</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Package className="h-8 w-8 mb-2" />
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products">
              <Button className="w-full">Manage Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
