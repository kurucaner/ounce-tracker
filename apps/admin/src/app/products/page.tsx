'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProductsPage() {
  const [name, setName] = useState('');
  const [mint, setMint] = useState('');
  const [metal, setMetal] = useState('');
  const [form, setForm] = useState('');
  const [weightOz, setWeightOz] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
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
        setMessage('✅ Product added successfully!');
        setName('');
        setMint('');
        setMetal('');
        setForm('');
        setWeightOz('');
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to add product'}`);
      }
    } catch (error) {
      setMessage('❌ Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <p className="text-muted-foreground">Add new bullion products</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Enter product specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Input
                  id="mint"
                  value={mint}
                  onChange={(e) => setMint(e.target.value)}
                  placeholder="e.g., PAMP"
                  required
                />
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
                <p className="text-xs text-muted-foreground">
                  Weight in troy ounces
                </p>
              </div>

              {message && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  {message}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Field Descriptions</CardTitle>
            <CardDescription>How to fill out each field</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Product Name</h4>
              <p className="text-muted-foreground">
                Full product name including weight, metal, mint, and design
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Mint</h4>
              <p className="text-muted-foreground">
                The manufacturer (e.g., PAMP, Perth Mint, Royal Canadian Mint)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Metal</h4>
              <p className="text-muted-foreground">
                Primary precious metal type
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Form</h4>
              <p className="text-muted-foreground">
                Physical form of the product (bar, coin, or round)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Weight</h4>
              <p className="text-muted-foreground">
                Weight in troy ounces (1 troy oz = 31.1 grams)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

