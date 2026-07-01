/**
 * Simple in-memory cache with TTL support
 * In production, use Redis or similar for distributed caching
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number; // in milliseconds

  constructor(defaultTTLMinutes: number = 60) {
    this.defaultTTL = defaultTTLMinutes * 60 * 1000;
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, ...params: any[]): string {
    return `${prefix}:${params.join(":")}`;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    console.log(`💾 Cache HIT: ${key}`);
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiresAt,
    });

    console.log(`💾 Cache SET: ${key} (expires in ${ttlMinutes || this.defaultTTL / 60000} minutes)`);
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    console.log("🧹 Clearing all cache");
    this.cache.clear();
  }

  /**
   * Get all cache entries (for monitoring)
   */
  getAll(): Map<string, CacheEntry<any>> {
    return new Map(this.cache);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach((entry) => {
      if (entry.expiresAt > Date.now()) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheSize: this.calculateCacheSize(),
    };
  }

  /**
   * Rough estimation of cache size in bytes
   */
  private calculateCacheSize(): number {
    let size = 0;
    this.cache.forEach((entry) => {
      size += JSON.stringify(entry.value).length;
    });
    return size;
  }

  /**
   * Cleanup expired entries periodically
   */
  cleanup(): number {
    let cleaned = 0;
    this.cache.forEach((entry, key) => {
      if (entry.expiresAt < Date.now()) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }

    return cleaned;
  }

  /**
   * Get or fetch - returns cached value or calls fetcher function
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    console.log(`💾 Cache MISS: ${key}, fetching...`);

    try {
      // Fetch fresh data
      const data = await fetcher();

      // Store in cache
      this.set(key, data, ttlMinutes);

      return data;
    } catch (error) {
      console.error(`❌ Error fetching data for cache key ${key}:`, error);
      throw error;
    }
  }
}

// Export singleton cache instance with 1 hour default TTL
export const cacheService = new CacheService(60);

// Periodically clean up expired entries (every 30 minutes)
setInterval(() => {
  cacheService.cleanup();
}, 30 * 60 * 1000);
