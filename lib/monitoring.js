/**
 * Monitoring & Observability System
 * Tracks performance, errors, and business metrics
 * 
 * LOCATION: lib/monitoring.js
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class MonitoringSystem {
  constructor() {
    this.requestContext = new Map();
  }

  /**
   * Start tracking a request
   */
  startRequest(requestId) {
    this.requestContext.set(requestId, {
      startTime: Date.now(),
      stages: {},
      errors: [],
      metrics: {},
    });
  }

  /**
   * Track a stage duration
   */
  trackStage(requestId, stageName, duration) {
    const context = this.requestContext.get(requestId);
    if (context) {
      context.stages[stageName] = duration;
    }
  }

  /**
   * Track a metric
   */
  trackMetric(requestId, metricName, value, unit = '') {
    const context = this.requestContext.get(requestId);
    if (context) {
      context.metrics[metricName] = { value, unit };
    }
  }

  /**
   * Log an error
   */
  async logError(requestId, error, context = {}) {
    const errorData = {
      request_id: requestId,
      error_type: error.name || 'Error',
      error_message: error.message,
      stack_trace: error.stack,
      context: context,
      created_at: new Date().toISOString(),
    };

    // Save to request context
    const reqContext = this.requestContext.get(requestId);
    if (reqContext) {
      reqContext.errors.push(errorData);
    }

    // Log to database
    try {
      await supabase.from('error_logs').insert(errorData);
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }

    // Console log for immediate visibility
    console.error(`[${requestId}] ERROR:`, error.message);
    console.error('Context:', context);
  }

  /**
   * Log a business event
   */
  async logEvent(eventName, data = {}) {
    const eventData = {
      event_name: eventName,
      event_data: data,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('events').insert(eventData);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Complete request tracking
   */
  async completeRequest(requestId, success = true) {
    const context = this.requestContext.get(requestId);
    if (!context) return;

    const totalDuration = Date.now() - context.startTime;

    const requestData = {
      request_id: requestId,
      success,
      total_duration_ms: totalDuration,
      stages: context.stages,
      metrics: context.metrics,
      error_count: context.errors.length,
      created_at: new Date(context.startTime).toISOString(),
    };

    // Log to database
    try {
      await supabase.from('request_logs').insert(requestData);
    } catch (error) {
      console.error('Failed to log request:', error);
    }

    // Log performance summary
    console.log(`[${requestId}] COMPLETED in ${totalDuration}ms`);
    console.log('Stages:', context.stages);
    console.log('Metrics:', context.metrics);

    // Check for performance issues
    this.checkPerformance(requestId, totalDuration, context.stages);

    // Clean up
    this.requestContext.delete(requestId);
  }

  /**
   * Check for performance issues
   */
  checkPerformance(requestId, totalDuration, stages) {
    const thresholds = {
      total: 20000,      // 20 seconds
      intent_parser: 5000,
      roadmap: 6000,
      search: 5000,
      normalize: 3000,
      compatibility: 2000,
      optimize: 1000,
    };

    // Check total duration
    if (totalDuration > thresholds.total) {
      console.warn(`⚠️  [${requestId}] SLOW REQUEST: ${totalDuration}ms (threshold: ${thresholds.total}ms)`);
    }

    // Check individual stages
    for (const [stage, duration] of Object.entries(stages)) {
      const threshold = thresholds[stage] || 5000;
      if (duration > threshold) {
        console.warn(`⚠️  [${requestId}] SLOW STAGE: ${stage} took ${duration}ms (threshold: ${threshold}ms)`);
      }
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(timeRange = '24h') {
    const cutoff = this.getTimeCutoff(timeRange);

    const { data, error } = await supabase
      .from('request_logs')
      .select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }

    const analytics = {
      totalRequests: data.length,
      successRate: data.filter(r => r.success).length / data.length * 100,
      avgDuration: 0,
      p50Duration: 0,
      p95Duration: 0,
      p99Duration: 0,
      slowestStages: {},
      errorRate: 0,
    };

    // Calculate durations
    const durations = data.map(r => r.total_duration_ms).sort((a, b) => a - b);
    analytics.avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    analytics.p50Duration = durations[Math.floor(durations.length * 0.5)];
    analytics.p95Duration = durations[Math.floor(durations.length * 0.95)];
    analytics.p99Duration = durations[Math.floor(durations.length * 0.99)];

    // Calculate error rate
    const totalErrors = data.reduce((sum, r) => sum + r.error_count, 0);
    analytics.errorRate = (totalErrors / data.length * 100).toFixed(2);

    // Find slowest stages
    const stageData = {};
    data.forEach(request => {
      Object.entries(request.stages || {}).forEach(([stage, duration]) => {
        if (!stageData[stage]) {
          stageData[stage] = [];
        }
        stageData[stage].push(duration);
      });
    });

    Object.entries(stageData).forEach(([stage, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      analytics.slowestStages[stage] = Math.round(avg);
    });

    return analytics;
  }

  /**
   * Get error analytics
   */
  async getErrorAnalytics(timeRange = '24h') {
    const cutoff = this.getTimeCutoff(timeRange);

    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', cutoff);

    if (error) {
      console.error('Failed to fetch error analytics:', error);
      return null;
    }

    const analytics = {
      totalErrors: data.length,
      byType: {},
      topErrors: [],
    };

    // Group by error type
    data.forEach(log => {
      const type = log.error_type;
      analytics.byType[type] = (analytics.byType[type] || 0) + 1;
    });

    // Find top errors
    const errorCounts = {};
    data.forEach(log => {
      const key = log.error_message;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    analytics.topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    return analytics;
  }

  /**
   * Get business metrics
   */
  async getBusinessMetrics(timeRange = '24h') {
    const cutoff = this.getTimeCutoff(timeRange);

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', cutoff);

    if (error) {
      console.error('Failed to fetch business metrics:', error);
      return null;
    }

    const metrics = {
      bundlesGenerated: 0,
      avgProductsPerBundle: 0,
      avgBundlePrice: 0,
      avgCompatibilityScore: 0,
      topCategories: {},
    };

    events.forEach(event => {
      if (event.event_name === 'bundle.generated') {
        metrics.bundlesGenerated++;
        const data = event.event_data;
        
        if (data.productCount) {
          metrics.avgProductsPerBundle += data.productCount;
        }
        if (data.totalPrice) {
          metrics.avgBundlePrice += data.totalPrice;
        }
        if (data.compatibilityScore) {
          metrics.avgCompatibilityScore += data.compatibilityScore;
        }
      }

      if (event.event_name === 'category.searched') {
        const category = event.event_data.category;
        metrics.topCategories[category] = (metrics.topCategories[category] || 0) + 1;
      }
    });

    // Calculate averages
    if (metrics.bundlesGenerated > 0) {
      metrics.avgProductsPerBundle = (metrics.avgProductsPerBundle / metrics.bundlesGenerated).toFixed(1);
      metrics.avgBundlePrice = (metrics.avgBundlePrice / metrics.bundlesGenerated).toFixed(2);
      metrics.avgCompatibilityScore = (metrics.avgCompatibilityScore / metrics.bundlesGenerated).toFixed(2);
    }

    return metrics;
  }

  /**
   * Generate health check report
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      checks: {},
      timestamp: new Date().toISOString(),
    };

    // Check database
    try {
      await supabase.from('request_logs').select('id').limit(1);
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'unhealthy';
    }

    // Check recent error rate
    const errorAnalytics = await this.getErrorAnalytics('1h');
    if (errorAnalytics && errorAnalytics.totalErrors > 50) {
      health.checks.errorRate = 'warning';
      health.status = 'degraded';
    } else {
      health.checks.errorRate = 'healthy';
    }

    // Check recent performance
    const perfAnalytics = await this.getPerformanceAnalytics('1h');
    if (perfAnalytics && perfAnalytics.p95Duration > 20000) {
      health.checks.performance = 'warning';
      health.status = 'degraded';
    } else {
      health.checks.performance = 'healthy';
    }

    return health;
  }

  /**
   * Helper: Get time cutoff for time range
   */
  getTimeCutoff(timeRange) {
    const now = new Date();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const ms = ranges[timeRange] || ranges['24h'];
    return new Date(now.getTime() - ms).toISOString();
  }
}

export default MonitoringSystem;
