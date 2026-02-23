import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database';
import { LLMService } from '../services/llm';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    backend: { status: 'up' | 'down'; latency?: number };
    database: { status: 'up' | 'down'; latency?: number };
    llm: { status: 'up' | 'down' | 'unconfigured'; latency?: number };
  };
}

router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  const dbStart = Date.now();
  const dbHealthy = await checkDatabaseHealth();
  const dbLatency = Date.now() - dbStart;

  const llmStart = Date.now();
  const llmHealthy = await LLMService.checkConnection();
  const llmLatency = Date.now() - llmStart;

  const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here';

  const health: HealthStatus = {
    status: dbHealthy ? (llmHealthy ? 'healthy' : 'degraded') : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      backend: {
        status: 'up',
        latency: Date.now() - startTime,
      },
      database: {
        status: dbHealthy ? 'up' : 'down',
        latency: dbLatency,
      },
      llm: {
        status: !hasApiKey ? 'unconfigured' : llmHealthy ? 'up' : 'down',
        latency: hasApiKey ? llmLatency : undefined,
      },
    },
  };

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

router.get('/ready', async (req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();
  if (dbHealthy) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

export { router as healthRoutes };
