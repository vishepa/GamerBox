import { Router } from 'express';
import { getAppList } from '../services/steam.js';

const router = Router();

router.get('/catalogue', async (req, res) => {
  try {
    const data = await getAppList();
    res.json(data);
  } catch (error) {
    const status = error.message.includes('Steam API') ? 502 : 500;
    res.status(status).json({ error: error.message });
  }
});

export default router;
