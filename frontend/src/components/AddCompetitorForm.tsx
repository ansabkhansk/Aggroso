import { useState } from 'react';
import { api } from '@/services/api';
import type { Competitor, CompetitorType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AddCompetitorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (competitor: Competitor) => void;
  currentCount: number;
}

export function AddCompetitorForm({
  open,
  onOpenChange,
  onSuccess,
  currentCount,
}: AddCompetitorFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<CompetitorType>('other');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxReached = currentCount >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setError('Name and URL are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const competitor = await api.competitors.create({
        name: name.trim(),
        url: url.trim(),
        type,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      });

      onSuccess(competitor);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add competitor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setUrl('');
    setType('other');
    setTags('');
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Competitor</DialogTitle>
          <DialogDescription>
            Add a competitor's page to track for changes. You can track up to 10
            competitors.
          </DialogDescription>
        </DialogHeader>

        {maxReached ? (
          <div className="py-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Maximum number of competitors (10) reached.</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Please delete an existing competitor before adding a new one.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Competitor X Pricing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://competitor.com/pricing"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the full URL of the page you want to track
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Page Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as CompetitorType)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pricing">Pricing Page</SelectItem>
                  <SelectItem value="docs">Documentation</SelectItem>
                  <SelectItem value="changelog">Changelog</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                placeholder="e.g., direct, enterprise, saas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Competitor
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
