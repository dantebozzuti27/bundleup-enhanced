/**
 * Caching Layer - Multi-Level Cache System
 * Level 1: Redis (in-memory, fast)
 * Level 2: Database (persistent fallback)
 * Level 3: Generate new
 * 
 * LOCATION: lib/cache-layer.js
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createRedisClient } from 'redis';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class CacheLayer {
  constructor() {
    this.redis = null;
    this.redisEnabled = process.env.REDIS_URL ? true : false;
    this.defaultTTL = 3600; // 1 hour
    this.initRedis();
  }

  /**
   * Initialize Redis connection
   */
  async initRedis() {
    if (!this.redisEnabled) {
      console.log('⚠️  Redis not configured. Using database-only caching.');
      return;
    }

    try {
      this.redis = createRedisClient({
        url: process.env.REDIS_URL,
      });

      this.redis.on('error', (err) => {
        console.error('Redis error:', err);
        this.redisEnabled = false;
      });

      await this.redis.connect();
      console.log('✅ Redis connected');
    } catch (error) {
      console.error('Redis connection failed:', error);
      this.redisEnabled = false;
    }
  }

  /**
   * Generate cache key from query
   */
  generateCacheKey(prefix, data) {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
    
    return `${prefix}:${hash}`;
  }

  /**
   * Get from cache (multi-level)
   */
  async get(key) {
    // Level 1: Try Redis
    if (this.redisEnabled && this.redis) {
      try {
        const cached = await this.redis.get(key);
        if (cached) {
          console.log(`✅ Cache HIT (Redis): ${key}`);
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Redis get error:', error);
      }
    }

    // Level 2: Try Database
    try {
      const { data, error } = await supabase
        .from('cache')
        .select('value, expires_at')
        .eq('key', key)
        .single();

      if (!error && data) {
        // Check if expired
        if (new Date(data.expires_at) > new Date()) {
          console.log(`✅ Cache HIT (Database): ${key}`);
          
          // Promote to Redis
          if (this.redisEnabled && this.redis) {
            const ttl = Math.floor((new Date(data.expires_at) - new Date()) / 1000);
            await this.redis.setEx(key, ttl, JSON.stringify(data.value));
          }
          
          return data.value;
        } else {
          // Delete expired entry
          await supabase.from('cache').delete().eq('key', key);
        }
      }
    } catch (error) {
      console.error('Database cache get error:', error);
    }

    console.log(`❌ Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set cache value (multi-level)
   */
  async set(key, value, ttl = this.defaultTTL) {
    const expiresAt = new Date(Date.now() + ttl * 1000);

    // Level 1: Set in Redis
    if (this.redisEnabled && this.redis) {
      try {
        await this.redis.setEx(key, ttl, JSON.stringify(value));
      } catch (error) {
        console.error('Redis set error:', error);
      }
    }

    // Level 2: Set in Database
    try {
      await supabase.from('cache').upsert({
        key,
        value,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Database cache set error:', error);
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key) {
    // Delete from Redis
    if (this.redisEnabled && this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }

    // Delete from Database
    try {
      await supabase.from('cache').delete().eq('key', key);
    } catch (error) {
      console.error('Database cache delete error:', error);
    }
  }

  /**
   * Clear all cache entries matching a pattern
   */
  async clearPattern(pattern) {
    // Redis pattern delete
    if (this.redisEnabled && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(keys);
          console.log(`Cleared ${keys.length} Redis keys matching ${pattern}`);
        }
      } catch (error) {
        console.error('Redis pattern delete error:', error);
      }
    }

    // Database pattern delete
    try {
      const { data } = await supabase
        .from('cache')
        .select('key')
        .like('key', pattern.replace('*', '%'));

      if (data && data.length > 0) {
        const keys = data.map(row => row.key);
        await supabase.from('cache').delete().in('key', keys);
        console.log(`Cleared ${keys.length} database cache entries matching ${pattern}`);
      }
    } catch (error) {
      console.error('Database pattern delete error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const stats = {
      redis: { connected: false, keys: 0 },
      database: { entries: 0, totalSize: 0 },
    };

    // Redis stats
    if (this.redisEnabled && this.redis) {
      try {
        stats.redis.connected = true;
        stats.redis.keys = await this.redis.dbSize();
      } catch (error) {
        console.error('Redis stats error:', error);
      }
    }

    // Database stats
    try {
      const { data, error } = await supabase
        .from('cache')
        .select('key, value')
        .gte('expires_at', new Date().toISOString());

      if (!error && data) {
        stats.database.entries = data.length;
        stats.database.totalSize = JSON.stringify(data).length;
      }
    } catch (error) {
      console.error('Database stats error:', error);
    }

    return stats;
  }

  /**
   * Clean expired entries from database
   */
  async cleanExpired() {
    try {
      const { data, error } = await supabase
        .from('cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (!error) {
        console.log('✅ Cleaned expired cache entries');
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Wrap a function with caching
   */
  async wrap(key, fn, ttl = this.defaultTTL) {
    // Try cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, ttl);

    return result;
  }

  /**
   * Close connections
   */
  async close() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export default CacheLayer;
