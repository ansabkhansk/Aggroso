import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import type { Competitor, HistoryResult, CheckResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiffView } from '@/components/DiffView';
import { ChangesSummary } from '@/components/ChangesSummary';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export function CompetitorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [competitor, setCompetitor] = useState<Competitor | null>(null);
  const [history, setHistory] = useState<HistoryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [comp, hist] = await Promise.all([
        api.competitors.get(id),
        api.competitors.history(id),
      ]);
      setCompetitor(comp);
      setHistory(hist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCheck = async () => {
    if (!id) return;
    try {
      setChecking(true);
      setError(null);
      setCheckResult(null);
      const result = await api.competitors.check(id);
      setCheckResult(result);
      setCompetitor(result.competitor);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check competitor');
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this competitor?')) return;
    try {
      setDeleting(true);
      await api.competitors.delete(id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete competitor');
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      pricing: 'bg-green-100 text-green-800',
      docs: 'bg-blue-100 text-blue-800',
      changelog: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[type] || colors.other}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !competitor) {
    return (
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!competitor) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCheck} disabled={checking}>
            <RefreshCw className={`h-4 w-4 mr-1 ${checking ? 'animate-spin' : ''}`} />
            Check Now
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{competitor.name}</CardTitle>
              <a
                href={competitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                {competitor.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              {getTypeBadge(competitor.type)}
              {getStatusBadge(competitor.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Checked</p>
              <p className="text-sm">
                {competitor.lastCheckedAt
                  ? new Date(competitor.lastCheckedAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(competitor.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tags</p>
              <div className="flex gap-1 flex-wrap mt-1">
                {competitor.tags?.length > 0 ? (
                  competitor.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </div>
          {competitor.lastError && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-md">
              <p className="text-sm font-medium text-destructive">Last Error</p>
              <p className="text-sm text-destructive/80">{competitor.lastError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {checkResult && (
        <Card className={checkResult.hasChanges ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle>
              {checkResult.isFirstCheck
                ? 'Initial Snapshot Captured'
                : checkResult.hasChanges
                ? 'Changes Detected!'
                : 'No Changes'}
            </CardTitle>
            <CardDescription>
              {checkResult.isFirstCheck
                ? 'This is the first snapshot. Future checks will compare against this.'
                : checkResult.hasChanges
                ? 'The page content has changed since the last check.'
                : 'The page content is the same as the last check.'}
            </CardDescription>
          </CardHeader>
          {checkResult.change && (
            <CardContent>
              <ChangesSummary change={checkResult.change} expanded showDiff />
            </CardContent>
          )}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Change History</CardTitle>
            <CardDescription>Last 5 detected changes</CardDescription>
          </CardHeader>
          <CardContent>
            {history?.changes && history.changes.length > 0 ? (
              <div className="space-y-4">
                {history.changes.map((change) => (
                  <ChangesSummary key={change.id} change={change} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No changes detected yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Snapshot History</CardTitle>
            <CardDescription>Last 5 content snapshots</CardDescription>
          </CardHeader>
          <CardContent>
            {history?.snapshots && history.snapshots.length > 0 ? (
              <div className="space-y-3">
                {history.snapshots.map((snapshot, index) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Snapshot #{history.snapshots.length - index}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(snapshot.fetchedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {snapshot.contentLength.toLocaleString()} chars
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {snapshot.contentHash.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No snapshots yet. Click "Check Now" to capture the first snapshot.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {history?.changes && history.changes.length > 0 && history.changes[0].diff && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Diff</CardTitle>
            <CardDescription>
              Changes from {new Date(history.changes[0].detectedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DiffView diff={history.changes[0].diff} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
