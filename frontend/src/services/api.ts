import type {
  Competitor,
  Change,
  HealthStatus,
  CheckResult,
  HistoryResult,
  CreateCompetitorInput,
  UpdateCompetitorInput,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  health: {
    check: () => fetchApi<HealthStatus>('/health'),
  },

  competitors: {
    list: () => fetchApi<Competitor[]>('/competitors'),

    get: (id: string) => fetchApi<Competitor>(`/competitors/${id}`),

    create: (data: CreateCompetitorInput) =>
      fetchApi<Competitor>('/competitors', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateCompetitorInput) =>
      fetchApi<Competitor>(`/competitors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<void>(`/competitors/${id}`, {
        method: 'DELETE',
      }),

    check: (id: string) =>
      fetchApi<CheckResult>(`/competitors/${id}/check`, {
        method: 'POST',
      }),

    checkAll: () =>
      fetchApi<{
        total: number;
        successful: number;
        failed: number;
        results: Array<{
          competitorId: string;
          competitorName: string;
          status: 'fulfilled' | 'rejected';
          data?: CheckResult;
          error?: string;
        }>;
      }>('/competitors/check-all', {
        method: 'POST',
      }),

    history: (id: string) =>
      fetchApi<HistoryResult>(`/competitors/${id}/history`),
  },

  changes: {
    list: (options?: { important?: boolean; severity?: string; limit?: number }) => {
      const params = new URLSearchParams();
      if (options?.important) params.set('important', 'true');
      if (options?.severity) params.set('severity', options.severity);
      if (options?.limit) params.set('limit', String(options.limit));
      const query = params.toString();
      return fetchApi<Change[]>(`/changes${query ? `?${query}` : ''}`);
    },

    get: (id: string) => fetchApi<Change>(`/changes/${id}`),
  },
};
