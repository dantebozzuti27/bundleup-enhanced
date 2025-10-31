/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 * 
 * LOCATION: middleware/rate-limiter.js
 */

import { LRUCache } from 'lru-cache';

// In-memory rate limit cache (use Redis in production for multi-server)
const rateLimitCache = new LRUCache({
  max: 500, // Maximum number of IP addresses to track
  ttl: 1000 * 60 * 15, // 15 minutes
});

export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 10, // requests per window
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  } = options;

  return async (req, res, next) => {
    const key = keyGenerator(req);
    const record = rateLimitCache.get(key) || { count: 0, resetTime: Date.now() + windowMs };

    if (Date.now() > record.resetTime) {
      // Reset the window
      record.count = 0;
      record.resetTime = Date.now() + windowMs;
    }

    record.count++;
    rateLimitCache.set(key, record);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    if (record.count > max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000),
      });
    }

    next?.();
  };
};

// Export pre-configured limiters
export const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 requests per 15 minutes
  message: 'Rate limit exceeded. This endpoint is resource-intensive.',
});

export const standardLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export const generousLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
});
