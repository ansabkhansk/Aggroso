import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { HealthStatus, Change } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChangesSummary } from '@/components/ChangesSummary';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Server,
  Brain,
  Filter,
} from 'lucide-react';

export function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'important' | 'major' | 'minor'>('all');

  const fetchHealth = async () => {
    try {
      const healthData = await api.health.check();
      setHealth(healthData);
    } catch {
      setHealth(null);
    }
  };

  const fetchChanges = async () => {
    try {
      let options: { important?: boolean; severity?: string } = {};
      if (filter === 'important') {
        options.important = true;
      } else if (filter === 'major' || filter === 'minor') {
        options.severity = filter;
      }
      const changesData = await api.changes.list({ ...options, limit: 20 });
      setChanges(changesData);
    } catch {
      setChanges([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHealth(), fetchChanges()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchChanges();
  }, [filter]);

  const getStatusIcon = (status: 'up' | 'down' | 'unconfigured') => {
    switch (status) {
      case 'up':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'unconfigured':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'unhealthy' | 'degraded') => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      case 'degraded':
        return <Badge variant="warning">Degraded</Badge>;
    }
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
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground mt-1">
            Monitor service health and view change history
          </p>
        </div>
        <Button variant="outline" onClick={() => { fetchHealth(); fetchChanges(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList>
          <TabsTrigger value="health">Service Health</TabsTrigger>
          <TabsTrigger value="changes">Change History</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          {health ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Overall Status</CardTitle>
                    <CardDescription>
                      Last checked: {new Date(health.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(health.status)}
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Backend API
                    </CardTitle>
                    {getStatusIcon(health.services.backend.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {health.services.backend.status}
                    </div>
                    {health.services.backend.latency !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Latency: {health.services.backend.latency}ms
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database
                    </CardTitle>
                    {getStatusIcon(health.services.database.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {health.services.database.status}
                    </div>
                    {health.services.database.latency !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Latency: {health.services.database.latency}ms
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      LLM Service
                    </CardTitle>
                    {getStatusIcon(health.services.llm.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {health.services.llm.status === 'unconfigured'
                        ? 'Not Configured'
                        : health.services.llm.status}
                    </div>
                    {health.services.llm.status === 'unconfigured' ? (
                      <p className="text-xs text-muted-foreground">
                        Add OPENAI_API_KEY to enable AI summaries
                      </p>
                    ) : health.services.llm.latency !== undefined ? (
                      <p className="text-xs text-muted-foreground">
                        Latency: {health.services.llm.latency}ms
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Unable to connect to backend
                </CardTitle>
                <CardDescription>
                  The backend service is not responding. Please check that all services are running.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="changes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Change History</CardTitle>
                  <CardDescription>
                    All detected changes across tracked competitors
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="text-sm border rounded-md px-2 py-1 bg-background"
                  >
                    <option value="all">All Changes</option>
                    <option value="important">Important Only</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {changes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No changes found matching the selected filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {changes.map((change) => (
                    <ChangesSummary key={change.id} change={change} expanded />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
