import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import type { Competitor, Change } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddCompetitorForm } from '@/components/AddCompetitorForm';
import { CompetitorCard } from '@/components/CompetitorCard';
import { ChangesSummary } from '@/components/ChangesSummary';
import { 
  RefreshCw, 
  Plus, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function HomePage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [recentChanges, setRecentChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAll, setCheckingAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [competitorList, changesList] = await Promise.all([
        api.competitors.list(),
        api.changes.list({ limit: 5 }),
      ]);
      setCompetitors(competitorList);
      setRecentChanges(changesList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckAll = async () => {
    try {
      setCheckingAll(true);
      await api.competitors.checkAll();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check competitors');
    } finally {
      setCheckingAll(false);
    }
  };

  const handleCompetitorAdded = (competitor: Competitor) => {
    setCompetitors(prev => [competitor, ...prev]);
    setShowAddForm(false);
  };

  const handleCompetitorDeleted = (id: string) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
  };

  const handleCompetitorChecked = (updated: Competitor) => {
    setCompetitors(prev => prev.map(c => c.id === updated.id ? updated : c));
    fetchData();
  };

  const stats = {
    total: competitors.length,
    healthy: competitors.filter(c => c.status === 'success').length,
    errors: competitors.filter(c => c.status === 'error').length,
    pending: competitors.filter(c => c.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitive Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Track competitor changes and get AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCheckAll}
            disabled={checkingAll || competitors.length === 0}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${checkingAll ? 'animate-spin' : ''}`} />
            Check All
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Competitor
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Competitors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">of 10 maximum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
            <p className="text-xs text-muted-foreground">successfully tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">awaiting first check</p>
          </CardContent>
        </Card>
      </div>

      {competitors.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Add your first competitor to start tracking changes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Add a competitor's URL (pricing page, docs, changelog)</li>
                  <li>2. Click "Check Now" to fetch the initial content</li>
                  <li>3. Check again later to see what changed</li>
                  <li>4. Get AI-powered summaries of important changes</li>
                </ol>
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Competitor
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tracked Competitors</h2>
              <Badge variant="outline">{competitors.length} / 10</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {competitors.map((competitor) => (
                <CompetitorCard
                  key={competitor.id}
                  competitor={competitor}
                  onDeleted={handleCompetitorDeleted}
                  onChecked={handleCompetitorChecked}
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Changes</h2>
            {recentChanges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No changes detected yet. Check your competitors to see updates.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentChanges.map((change) => (
                  <ChangesSummary key={change.id} change={change} />
                ))}
                <Link
                  to="/status"
                  className="block text-center text-sm text-primary hover:underline"
                >
                  View all changes
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <AddCompetitorForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={handleCompetitorAdded}
        currentCount={competitors.length}
      />
    </div>
  );
}
