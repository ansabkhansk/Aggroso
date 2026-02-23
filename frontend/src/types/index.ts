export type CompetitorType = 'pricing' | 'docs' | 'changelog' | 'other';
export type CompetitorStatus = 'pending' | 'success' | 'error';
export type ChangeSeverity = 'major' | 'minor' | 'cosmetic';

export interface Competitor {
  id: string;
  name: string;
  url: string;
  type: CompetitorType;
  tags: string[];
  lastCheckedAt: string | null;
  status: CompetitorStatus;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Snapshot {
  id: string;
  competitorId: string;
  content: string;
  contentHash: string;
  contentLength: number;
  fetchedAt: string;
}

export interface Change {
  id: string;
  competitorId: string;
  previousSnapshotId: string;
  currentSnapshotId: string;
  diff: string;
  aiSummary: string | null;
  importantChanges: string[];
  severity: ChangeSeverity;
  isImportant: boolean;
  detectedAt: string;
  competitor?: Competitor;
  previousSnapshot?: Snapshot;
  currentSnapshot?: Snapshot;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    backend: { status: 'up' | 'down'; latency?: number };
    database: { status: 'up' | 'down'; latency?: number };
    llm: { status: 'up' | 'down' | 'unconfigured'; latency?: number };
  };
}

export interface CheckResult {
  competitor: Competitor;
  snapshot: Snapshot;
  change: Change | null;
  hasChanges: boolean;
  isFirstCheck: boolean;
}

export interface HistoryResult {
  snapshots: Snapshot[];
  changes: Change[];
}

export interface CreateCompetitorInput {
  name: string;
  url: string;
  type?: CompetitorType;
  tags?: string[];
}

export interface UpdateCompetitorInput {
  name?: string;
  url?: string;
  type?: CompetitorType;
  tags?: string[];
}
