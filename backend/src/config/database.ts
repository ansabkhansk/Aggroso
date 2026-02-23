import { DataSource } from 'typeorm';
import { Competitor, Snapshot, Change } from '../entities';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/aggroso';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: DATABASE_URL,
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [Competitor, Snapshot, Change],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
    return AppDataSource;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }
    await AppDataSource.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};
