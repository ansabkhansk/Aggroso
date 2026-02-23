import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import { initializeDatabase } from './config/database';

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
