import { Request, Response, NextFunction } from 'express';
import { RateLimitEntry } from '../types';

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;
const BURST_LIMIT = 5;
const BURST_WINDOW = 10000;

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  let entry = rateLimitStore.get(ip);

  if (!entry) {
    entry = {
      count: 0,
      burstCount: 0,
      resetTime: now + RATE_WINDOW,
      burstResetTime: now + BURST_WINDOW
    };
    rateLimitStore.set(ip, entry);
  }

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + RATE_WINDOW;
  }

  if (now > entry.burstResetTime) {
    entry.burstCount = 0;
    entry.burstResetTime = now + BURST_WINDOW;
  }

  if (entry.burstCount >= BURST_LIMIT) {
    res.status(429).json({
      error: 'Burst limit exceeded',
      message: `Maximum ${BURST_LIMIT} requests per ${BURST_WINDOW / 1000} seconds`,
      retryAfter: Math.ceil((entry.burstResetTime - now) / 1000)
    });
    return;
  }

  if (entry.count >= RATE_LIMIT) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${RATE_LIMIT} requests per minute`,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    });
    return;
  }

  entry.count++;
  entry.burstCount++;
  next();
};