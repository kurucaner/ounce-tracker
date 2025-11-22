'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared';

interface Dealer {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  created_at: string;
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch('/api/dealers');
      if (response.ok) {
        const data = await response.json();
        setDealers(data.dealers || []);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (dealer: Dealer) => {
    setEditingId(dealer.id);
    setName(dealer.name);
    setSlug(dealer.slug);
    setWebsiteUrl(dealer.website_url || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setWebsiteUrl('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingId ? `/api/dealers?id=${editingId}` : '/api/dealers';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, website_url: websiteUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(editingId ? '✅ Dealer updated successfully!' : '✅ Dealer added successfully!');
        setName('');
        setSlug('');
        setWebsiteUrl('');
        setEditingId(null);
        fetchDealers();
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to save dealer'}`);
      }
    } catch (error) {
      console.error('Error saving dealer:', error);
      setMessage('❌ Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Dealers</h1>
        <p className="text-muted-foreground">View and manage bullion dealers</p>
      </div>

      <div className="grid gap-6">
        {/* Dealers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Dealers ({dealers.length})</CardTitle>
            <CardDescription>Click edit to update dealer information</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading dealers...</div>
            ) : dealers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No dealers found. Add your first dealer below.
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealers.map((dealer) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">{dealer.name}</TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-xs">{dealer.slug}</code>
                        </TableCell>
                        <TableCell>
                          {dealer.website_url ? (
                            <a
                              href={dealer.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Link
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(dealer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(dealer)}
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

        {/* Add/Edit Form */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Dealer' : 'Add New Dealer'}</CardTitle>
              <CardDescription>
                {editingId ? 'Update dealer information' : 'Enter dealer information'}
              </CardDescription>
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

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : editingId ? 'Update Dealer' : 'Add Dealer'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
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
                  URL-safe identifier used in links. Use lowercase, hyphens instead of spaces
                  (e.g., &quot;new-york-gold-co&quot;)
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
    </div>
  );
}
