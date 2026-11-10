import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';

const router = Router();

router.get('/interests', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: db.getInterests(),
  });
});

router.get('/intents', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: db.getIntents(),
  });
});

export default router;

