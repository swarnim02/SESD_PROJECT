import express, { Application } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import itemRoutes from './routes/item.routes';
import claimRoutes from './routes/claim.routes';
import adminRoutes from './routes/admin.routes';
import { notFound, errorHandler } from './middleware/errorMiddleware';

// Side-effect import: subscribes NotificationService to the event bus.
import './services/NotificationService';

export function createApp(): Application {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/items', itemRoutes);
  app.use('/api/claims', claimRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
