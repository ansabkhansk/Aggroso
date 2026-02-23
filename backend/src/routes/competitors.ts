import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Competitor, Snapshot, Change } from '../entities';
import { FetcherService, DifferService, LLMService } from '../services';

const router = Router();

const MAX_COMPETITORS = 10;

router.get('/', async (req: Request, res: Response) => {
  try {
    const competitorRepo = AppDataSource.getRepository(Competitor);
    const competitors = await competitorRepo.find({
      order: { createdAt: 'DESC' },
    });
    res.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const competitorRepo = AppDataSource.getRepository(Competitor);
    const competitor = await competitorRepo.findOne({
      where: { id: req.params.id },
    });
    
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    
    res.json(competitor);
  } catch (error) {
    console.error('Error fetching competitor:', error);
    res.status(500).json({ error: 'Failed to fetch competitor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, url, type, tags } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!FetcherService.isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Must be a valid HTTP/HTTPS URL.' });
    }

    const competitorRepo = AppDataSource.getRepository(Competitor);
    
    const count = await competitorRepo.count();
    if (count >= MAX_COMPETITORS) {
      return res.status(400).json({ 
        error: `Maximum number of competitors (${MAX_COMPETITORS}) reached. Please delete one before adding more.` 
      });
    }

    const existing = await competitorRepo.findOne({ where: { url } });
    if (existing) {
      return res.status(400).json({ error: 'A competitor with this URL already exists' });
    }

    const competitor = competitorRepo.create({
      name: name.trim(),
      url: url.trim(),
      type: type || 'other',
      tags: tags || [],
      status: 'pending',
    });

    await competitorRepo.save(competitor);
    res.status(201).json(competitor);
  } catch (error) {
    console.error('Error creating competitor:', error);
    res.status(500).json({ error: 'Failed to create competitor' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, url, type, tags } = req.body;
    const competitorRepo = AppDataSource.getRepository(Competitor);
    
    const competitor = await competitorRepo.findOne({
      where: { id: req.params.id },
    });
    
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    if (url && url !== competitor.url && !FetcherService.isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (name) competitor.name = name.trim();
    if (url) competitor.url = url.trim();
    if (type) competitor.type = type;
    if (tags !== undefined) competitor.tags = tags;

    await competitorRepo.save(competitor);
    res.json(competitor);
  } catch (error) {
    console.error('Error updating competitor:', error);
    res.status(500).json({ error: 'Failed to update competitor' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const competitorRepo = AppDataSource.getRepository(Competitor);
    const result = await competitorRepo.delete(req.params.id);
    
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Competitor not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting competitor:', error);
    res.status(500).json({ error: 'Failed to delete competitor' });
  }
});

router.post('/:id/check', async (req: Request, res: Response) => {
  try {
    const competitorRepo = AppDataSource.getRepository(Competitor);
    const snapshotRepo = AppDataSource.getRepository(Snapshot);
    const changeRepo = AppDataSource.getRepository(Change);

    const competitor = await competitorRepo.findOne({
      where: { id: req.params.id },
    });

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    const fetchResult = await FetcherService.fetchUrl(competitor.url);

    const latestSnapshot = await snapshotRepo.findOne({
      where: { competitorId: competitor.id },
      order: { fetchedAt: 'DESC' },
    });

    const newSnapshot = snapshotRepo.create({
      competitorId: competitor.id,
      content: fetchResult.content,
      contentHash: fetchResult.contentHash,
      contentLength: fetchResult.contentLength,
    });
    await snapshotRepo.save(newSnapshot);

    competitor.lastCheckedAt = new Date();
    competitor.status = 'success';
    competitor.lastError = null;

    let change: Change | null = null;
    
    if (latestSnapshot && latestSnapshot.contentHash !== fetchResult.contentHash) {
      const diffResult = DifferService.generateDiff(latestSnapshot.content, fetchResult.content);
      
      let llmResult;
      try {
        llmResult = await LLMService.summarizeChanges(
          competitor.name,
          competitor.type,
          diffResult.diff
        );
      } catch {
        llmResult = LLMService.generateFallbackSummary(diffResult.diff);
      }

      change = changeRepo.create({
        competitorId: competitor.id,
        previousSnapshotId: latestSnapshot.id,
        currentSnapshotId: newSnapshot.id,
        diff: diffResult.diff,
        aiSummary: llmResult.summary,
        importantChanges: llmResult.importantChanges,
        severity: llmResult.severity,
        isImportant: llmResult.isImportant,
      });
      await changeRepo.save(change);
    }

    await competitorRepo.save(competitor);

    res.json({
      competitor,
      snapshot: newSnapshot,
      change,
      hasChanges: change !== null,
      isFirstCheck: latestSnapshot === null,
    });
  } catch (error) {
    const competitorRepo = AppDataSource.getRepository(Competitor);
    const competitor = await competitorRepo.findOne({
      where: { id: req.params.id },
    });
    
    if (competitor) {
      competitor.status = 'error';
      competitor.lastError = error instanceof Error ? error.message : 'Unknown error';
      competitor.lastCheckedAt = new Date();
      await competitorRepo.save(competitor);
    }

    console.error('Error checking competitor:', error);
    res.status(500).json({ 
      error: 'Failed to check competitor',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/check-all', async (req: Request, res: Response) => {
  try {
    const competitorRepo = AppDataSource.getRepository(Competitor);
    const competitors = await competitorRepo.find();

    const results = await Promise.allSettled(
      competitors.map(async (competitor) => {
        const response = await fetch(`http://localhost:${process.env.PORT || 3001}/api/competitors/${competitor.id}/check`, {
          method: 'POST',
        });
        return response.json();
      })
    );

    const summary = {
      total: competitors.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results: results.map((r, i) => ({
        competitorId: competitors[i].id,
        competitorName: competitors[i].name,
        status: r.status,
        ...(r.status === 'fulfilled' ? { data: r.value } : { error: (r as PromiseRejectedResult).reason }),
      })),
    };

    res.json(summary);
  } catch (error) {
    console.error('Error checking all competitors:', error);
    res.status(500).json({ error: 'Failed to check all competitors' });
  }
});

router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const snapshotRepo = AppDataSource.getRepository(Snapshot);
    const changeRepo = AppDataSource.getRepository(Change);

    const snapshots = await snapshotRepo.find({
      where: { competitorId: req.params.id },
      order: { fetchedAt: 'DESC' },
      take: 5,
    });

    const changes = await changeRepo.find({
      where: { competitorId: req.params.id },
      order: { detectedAt: 'DESC' },
      take: 5,
    });

    res.json({ snapshots, changes });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export { router as competitorRoutes };
