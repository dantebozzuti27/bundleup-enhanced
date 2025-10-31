/**
 * Error Recovery System
 * Provides fallbacks, retries, and circuit breakers
 * 
 * LOCATION: lib/error-recovery.js
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class ErrorRecovery {
  constructor() {
    this.circuitBreakers = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second base delay
  }

  /**
   * Execute with retry logic and exponential backoff
   */
  async withRetry(fn, options = {}) {
    const {
      maxRetries = this.maxRetries,
      retryDelay = this.retryDelay,
      onRetry = null,
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          
          if (onRetry) {
            onRetry(attempt, delay, error);
          }
          
          console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
  }

  /**
   * Execute with circuit breaker pattern
   */
  async withCircuitBreaker(serviceKey, fn, options = {}) {
    const {
      threshold = 5,      // Failures before opening circuit
      timeout = 60000,    // Time to wait before retry (1 minute)
      resetAfter = 300000, // Reset after 5 minutes of success
    } = options;

    let breaker = this.circuitBreakers.get(serviceKey);

    if (!breaker) {
      breaker = {
        failures: 0,
        lastFailure: null,
        state: 'closed', // closed = normal, open = blocked, half-open = testing
      };
      this.circuitBreakers.set(serviceKey, breaker);
    }

    // Check circuit state
    if (breaker.state === 'open') {
      const timeSinceFailure = Date.now() - breaker.lastFailure;
      
      if (timeSinceFailure < timeout) {
        throw new Error(`Circuit breaker open for ${serviceKey}. Try again in ${Math.ceil((timeout - timeSinceFailure) / 1000)}s`);
      }
      
      // Try half-open
      breaker.state = 'half-open';
    }

    try {
      const result = await fn();
      
      // Success - reset or close circuit
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failures = 0;
        console.log(`✅ Circuit breaker closed for ${serviceKey}`);
      }
      
      return result;
    } catch (error) {
      breaker.failures++;
      breaker.lastFailure = Date.now();
      
      if (breaker.failures >= threshold) {
        breaker.state = 'open';
        console.error(`🚨 Circuit breaker opened for ${serviceKey} after ${breaker.failures} failures`);
      }
      
      throw error;
    }
  }

  /**
   * Get cached results as fallback
   */
  async getCachedFallback(cacheKey, maxAge = 86400000) {
    try {
      const cutoff = new Date(Date.now() - maxAge).toISOString();
      
      const { data, error } = await supabase
        .from('cache')
        .select('*')
        .eq('key', cacheKey)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      console.log(`✅ Using cached fallback for ${cacheKey}`);
      return data[0].value;
    } catch (error) {
      console.error('Cache fallback failed:', error);
      return null;
    }
  }

  /**
   * Save result to cache
   */
  async saveToCache(cacheKey, value, ttl = 86400000) {
    try {
      await supabase.from('cache').upsert({
        key: cacheKey,
        value,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + ttl).toISOString(),
      });
    } catch (error) {
      console.error('Cache save failed:', error);
    }
  }

  /**
   * Execute with fallback chain
   */
  async withFallback(primaryFn, fallbackFns = []) {
    try {
      return await primaryFn();
    } catch (primaryError) {
      console.warn('Primary function failed:', primaryError.message);
      
      for (let i = 0; i < fallbackFns.length; i++) {
        try {
          console.log(`Trying fallback ${i + 1}/${fallbackFns.length}`);
          return await fallbackFns[i]();
        } catch (fallbackError) {
          console.warn(`Fallback ${i + 1} failed:`, fallbackError.message);
          
          if (i === fallbackFns.length - 1) {
            throw new Error(`All fallbacks exhausted. Last error: ${fallbackError.message}`);
          }
        }
      }
    }
  }

  /**
   * Graceful degradation - return partial results
   */
  async withGracefulDegradation(fn, defaultValue = null) {
    try {
      return await fn();
    } catch (error) {
      console.warn('Operation failed, returning degraded result:', error.message);
      return defaultValue;
    }
  }

  /**
   * Helper: sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset circuit breaker manually
   */
  resetCircuitBreaker(serviceKey) {
    const breaker = this.circuitBreakers.get(serviceKey);
    if (breaker) {
      breaker.state = 'closed';
      breaker.failures = 0;
      console.log(`Circuit breaker manually reset for ${serviceKey}`);
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitStatus() {
    const status = {};
    this.circuitBreakers.forEach((breaker, key) => {
      status[key] = {
        state: breaker.state,
        failures: breaker.failures,
        lastFailure: breaker.lastFailure ? new Date(breaker.lastFailure).toISOString() : null,
      };
    });
    return status;
  }
}

export default ErrorRecovery;
