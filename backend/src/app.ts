import express from 'express';
import cors from 'cors';
import { competitorRoutes } from './routes/competitors';
import { healthRoutes } from './routes/health';
import { changesRoutes } from './routes/changes';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/changes', changesRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;
