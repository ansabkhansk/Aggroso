import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Change, Competitor } from '../entities';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { important, severity, limit = 20 } = req.query;
    
    const changeRepo = AppDataSource.getRepository(Change);
    const queryBuilder = changeRepo
      .createQueryBuilder('change')
      .leftJoinAndSelect('change.competitor', 'competitor')
      .orderBy('change.detectedAt', 'DESC')
      .take(Number(limit));

    if (important === 'true') {
      queryBuilder.andWhere('change.isImportant = :isImportant', { isImportant: true });
    }

    if (severity && ['major', 'minor', 'cosmetic'].includes(severity as string)) {
      queryBuilder.andWhere('change.severity = :severity', { severity });
    }

    const changes = await queryBuilder.getMany();
    res.json(changes);
  } catch (error) {
    console.error('Error fetching changes:', error);
    res.status(500).json({ error: 'Failed to fetch changes' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const changeRepo = AppDataSource.getRepository(Change);
    const competitorRepo = AppDataSource.getRepository(Competitor);

    const totalChanges = await changeRepo.count();
    const importantChanges = await changeRepo.count({ where: { isImportant: true } });
    const totalCompetitors = await competitorRepo.count();

    const recentChanges = await changeRepo
      .createQueryBuilder('change')
      .select('DATE(change.detectedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(change.detectedAt)')
      .orderBy('date', 'DESC')
      .limit(7)
      .getRawMany();

    const severityCounts = await changeRepo
      .createQueryBuilder('change')
      .select('change.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('change.severity')
      .getRawMany();

    res.json({
      totalChanges,
      importantChanges,
      totalCompetitors,
      recentChanges,
      severityCounts,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const changeRepo = AppDataSource.getRepository(Change);
    const change = await changeRepo.findOne({
      where: { id: req.params.id },
      relations: ['competitor', 'previousSnapshot', 'currentSnapshot'],
    });

    if (!change) {
      return res.status(404).json({ error: 'Change not found' });
    }

    res.json(change);
  } catch (error) {
    console.error('Error fetching change:', error);
    res.status(500).json({ error: 'Failed to fetch change' });
  }
});

export { router as changesRoutes };
