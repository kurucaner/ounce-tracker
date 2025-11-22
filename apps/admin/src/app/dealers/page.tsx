'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from '@shared';

export default function DealersPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, website_url: websiteUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Dealer added successfully!');
        setName('');
        setSlug('');
        setWebsiteUrl('');
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to add dealer'}`);
      }
    } catch (error) {
      console.error('Error adding dealer:', error);
      setMessage('❌ Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Dealers</h1>
        <p className="text-muted-foreground">Add new bullion dealers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Dealer</CardTitle>
            <CardDescription>Enter dealer information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dealer Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., APMEX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., apmex"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (lowercase, no spaces)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {message && <div className="rounded-md bg-muted p-3 text-sm">{message}</div>}

              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {loading ? 'Adding...' : 'Add Dealer'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guidelines</CardTitle>
            <CardDescription>How to add dealers correctly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Dealer Name</h4>
              <p className="text-muted-foreground">
                The official business name (e.g., &quot;New York Gold Co&quot;)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Slug</h4>
              <p className="text-muted-foreground">
                URL-safe identifier used in links. Use lowercase, hyphens instead of spaces (e.g.,
                &quot;new-york-gold-co&quot;)
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Website URL</h4>
              <p className="text-muted-foreground">
                The dealer&apos;s homepage URL (optional but recommended)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
