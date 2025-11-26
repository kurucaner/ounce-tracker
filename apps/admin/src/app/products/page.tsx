'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared';

interface Product {
  id: string;
  name: string;
  mint: string;
  metal: string;
  form: string;
  weight_oz: number;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [mint, setMint] = useState('');
  const [metal, setMetal] = useState('');
  const [form, setForm] = useState('');
  const [weightOz, setWeightOz] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setMint(product.mint);
    setMetal(product.metal);
    setForm(product.form);
    setWeightOz(product.weight_oz.toString());
    setSheetOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setMint('');
    setMetal('');
    setForm('');
    setWeightOz('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingId ? `/api/products?id=${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mint,
          metal,
          form,
          weight_oz: Number.parseFloat(weightOz),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setName('');
        setMint('');
        setMetal('');
        setForm('');
        setWeightOz('');
        setEditingId(null);
        setSheetOpen(false);
        fetchProducts();
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to save product'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage('❌ Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatMetal = (metal: string) => {
    return metal.charAt(0).toUpperCase() + metal.slice(1);
  };

  const formatForm = (form: string) => {
    return form.charAt(0).toUpperCase() + form.slice(1);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <p className="text-muted-foreground">View and manage bullion products</p>
        </div>
        <Sheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            // Reset form when sheet closes
            if (!open) {
              resetForm();
            }
          }}
        >
          <SheetTrigger asChild>
            <Button
              onClick={() => {
                // Reset form when clicking "Add Product"
                resetForm();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingId ? 'Edit Product' : 'Add New Product'}</SheetTitle>
              <SheetDescription>
                {editingId ? 'Update product specifications' : 'Enter product specifications'}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., 1 oz Gold Bar PAMP Suisse Lady Fortuna"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mint">Mint *</Label>
                <Select value={mint} onValueChange={setMint} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAMP">PAMP</SelectItem>
                    <SelectItem value="RMC">RMC</SelectItem>
                    <SelectItem value="PerthMint">Perth Mint</SelectItem>
                    <SelectItem value="RoyalCanadianMint">Royal Canadian Mint</SelectItem>
                    <SelectItem value="USMint">US Mint</SelectItem>
                    <SelectItem value="Valcambi">Valcambi</SelectItem>
                    <SelectItem value="CreditSuisse">Credit Suisse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metal">Metal *</Label>
                <Select value={metal} onValueChange={setMetal} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="palladium">Palladium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Form *</Label>
                <Select value={form} onValueChange={setForm} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="coin">Coin</SelectItem>
                    <SelectItem value="round">Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (oz) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  value={weightOz}
                  onChange={(e) => setWeightOz(e.target.value)}
                  placeholder="e.g., 1"
                  required
                />
                <p className="text-xs text-muted-foreground">Weight in troy ounces</p>
              </div>

              {message && <div className="rounded-md bg-muted p-3 text-sm">{message}</div>}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setSheetOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6">
        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products ({products.length})</CardTitle>
            <CardDescription>Click edit to update product information</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products found. Add your first product below.
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Mint</TableHead>
                      <TableHead>Metal</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Weight (oz)</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.mint}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-muted px-2 py-1 text-xs">
                            {formatMetal(product.metal)}
                          </span>
                        </TableCell>
                        <TableCell>{formatForm(product.form)}</TableCell>
                        <TableCell>{product.weight_oz}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
