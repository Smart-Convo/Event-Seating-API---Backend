import { CacheEntry, CacheStats } from '../types';

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number;
  private stats: CacheStats;
  private responseTimes: number[];

  constructor(maxSize: number = 100, ttl: number = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = { hits: 0, misses: 0, size: 0, avgResponseTime: 0 };
    this.responseTimes = [];
    this.startCleanupTask();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    this.cache.delete(key);
    this.cache.set(key, entry);
    this.stats.hits++;
    return entry.data;
  }

  set(key: string, value: T): void {
  if (this.cache.has(key)) {
    this.cache.delete(key);
  } else if (this.cache.size >= this.maxSize) {
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      this.cache.delete(firstKey);
    }
  }

  this.cache.set(key, {
    data: value,
    timestamp: Date.now()
  });
  this.stats.size = this.cache.size;
}

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  getStats(): CacheStats {
    return {
      ...this.stats,
      avgResponseTime: this.calculateAvgResponseTime()
    };
  }

  addResponseTime(time: number): void {
    this.responseTimes.push(time);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
  }

  private calculateAvgResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    return sum / this.responseTimes.length;
  }

  private startCleanupTask(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.ttl) {
          this.cache.delete(key);
        }
      }
      this.stats.size = this.cache.size;
    }, 30000);
  }
}