import { Router, Request, Response } from 'express';
import { LRUCache } from '../cache/LRUCache';
import { RequestQueue } from '../utils/queue';
import { fetchUserFromDB, createUserInDB } from '../utils/database';
import { User } from '../types';

const router = Router();
const cache = new LRUCache<User>(100, 60000);
const queue = new RequestQueue();
const pendingRequests = new Map<number, Promise<User | null>>();

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  const cached = cache.get(userId.toString());
  if (cached) {
    const responseTime = Date.now() - startTime;
    cache.addResponseTime(responseTime);
    res.json({ ...cached, cached: true, responseTime });
    return;
  }

  let pending = pendingRequests.get(userId);
  if (!pending) {
    pending = queue.add(async () => {
      const user = await fetchUserFromDB(userId);
      if (user) {
        cache.set(userId.toString(), user);
      }
      return user;
    });
    pendingRequests.set(userId, pending);
    
    pending.finally(() => {
      pendingRequests.delete(userId);
    });
  }

  try {
    const user = await pending;
    const responseTime = Date.now() - startTime;
    cache.addResponseTime(responseTime);

    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        message: `No user exists with ID ${userId}` 
      });
      return;
    }

    res.json({ ...user, cached: false, responseTime });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  try {
    const newUser = await createUserInDB({ name, email });
    cache.set(newUser.id.toString(), newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.delete('/cache', (_req: Request, res: Response): void => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully' });
});

router.get('/cache/status', (_req: Request, res: Response): void => {
  res.json(cache.getStats());
});

export default router;