import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import type { Competitor } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface CompetitorCardProps {
  competitor: Competitor;
  onDeleted: (id: string) => void;
  onChecked: (competitor: Competitor) => void;
}

export function CompetitorCard({ competitor, onDeleted, onChecked }: CompetitorCardProps) {
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCheck = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setChecking(true);
      const result = await api.competitors.check(competitor.id);
      onChecked(result.competitor);
    } catch (err) {
      console.error('Check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${competitor.name}"?`)) return;
    try {
      setDeleting(true);
      await api.competitors.delete(competitor.id);
      onDeleted(competitor.id);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  const getStatusIcon = () => {
    switch (competitor.status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeBadge = () => {
    const colors: Record<string, string> = {
      pricing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      docs: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      changelog: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return (
      <Badge className={`text-xs ${colors[competitor.type] || colors.other}`}>
        {competitor.type}
      </Badge>
    );
  };

  return (
    <Link to={`/competitor/${competitor.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-base truncate flex items-center gap-2">
                {getStatusIcon()}
                {competitor.name}
              </CardTitle>
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(competitor.url, '_blank', 'noopener,noreferrer');
                }}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate cursor-pointer"
              >
                <span className="truncate">{new URL(competitor.url).hostname}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTypeBadge()}
              {competitor.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {competitor.lastCheckedAt
                ? `Checked ${formatRelativeTime(new Date(competitor.lastCheckedAt))}`
                : 'Never checked'}
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={handleCheck}
                disabled={checking || deleting}
              >
                <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={checking || deleting}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {competitor.status === 'error' && competitor.lastError && (
            <p className="mt-2 text-xs text-destructive truncate" title={competitor.lastError}>
              {competitor.lastError}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
