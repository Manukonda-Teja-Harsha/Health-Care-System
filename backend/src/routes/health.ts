import { Router, Request, Response } from 'express';
import { checkDbConnection } from '../config/db.js';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const isDbConnected = await checkDbConnection();

  if (isDbConnected) {
    return res.status(200).json({
      success: true,
      server: 'running',
      database: 'connected',
    });
  }

  return res.status(503).json({
    success: false,
    server: 'running',
    database: 'disconnected',
    message: 'Unable to connect to MySQL database on local port 3306',
  });
});

export default router;
