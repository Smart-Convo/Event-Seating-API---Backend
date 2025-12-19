export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  avgResponseTime: number;
}

export interface RateLimitEntry {
  count: number;
  burstCount: number;
  resetTime: number;
  burstResetTime: number;
}