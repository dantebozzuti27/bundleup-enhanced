/**
 * Database Schema - Supabase SQL
 * Run this in your Supabase SQL Editor
 * 
 * LOCATION: Save as database-schema.sql and run in Supabase
 */

-- =============================================
-- TABLE 1: Product Cache
-- Stores normalized product data
-- =============================================
CREATE TABLE IF NOT EXISTS product_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price DECIMAL(10, 2),
  link TEXT,
  source TEXT,
  thumbnail TEXT,
  normalized_specs JSONB,
  extraction_confidence DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for product_cache
CREATE INDEX idx_product_cache_specs ON product_cache USING GIN (normalized_specs);
CREATE INDEX idx_product_cache_price ON product_cache (price);
CREATE INDEX idx_product_cache_created ON product_cache (created_at);
CREATE INDEX idx_product_cache_title ON product_cache USING GIN (to_tsvector('english', title));

-- =============================================
-- TABLE 2: User Queries
-- Tracks all user queries and results
-- =============================================
CREATE TABLE IF NOT EXISTS user_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  query TEXT NOT NULL,
  request_id TEXT UNIQUE NOT NULL,
  result_count INTEGER,
  compatibility_score DECIMAL(3, 2),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_queries
CREATE INDEX idx_user_queries_user_id ON user_queries (user_id);
CREATE INDEX idx_user_queries_request_id ON user_queries (request_id);
CREATE INDEX idx_user_queries_created ON user_queries (created_at);

-- =============================================
-- TABLE 3: Cached Bundles
-- Stores generated bundles for reuse
-- =============================================
CREATE TABLE IF NOT EXISTS cached_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT UNIQUE NOT NULL,
  intent JSONB,
  roadmap JSONB,
  products JSONB,
  compatibility_result JSONB,
  ranked_bundles JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cached_bundles
CREATE INDEX idx_cached_bundles_query_hash ON cached_bundles (query_hash);
CREATE INDEX idx_cached_bundles_created ON cached_bundles (created_at);

-- =============================================
-- TABLE 4: Cost Tracking
-- Monitors API costs
-- =============================================
CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT,
  service TEXT NOT NULL, -- 'anthropic', 'serper', etc.
  cost DECIMAL(10, 4) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cost_tracking
CREATE INDEX idx_cost_tracking_service ON cost_tracking (service);
CREATE INDEX idx_cost_tracking_created ON cost_tracking (created_at);
CREATE INDEX idx_cost_tracking_request_id ON cost_tracking (request_id);

-- =============================================
-- TABLE 5: Cache (General Purpose)
-- Multi-level caching storage
-- =============================================
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cache
CREATE INDEX idx_cache_expires ON cache (expires_at);
CREATE INDEX idx_cache_created ON cache (created_at);

-- =============================================
-- TABLE 6: Request Logs
-- Performance monitoring
-- =============================================
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  total_duration_ms INTEGER,
  stages JSONB,
  metrics JSONB,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for request_logs
CREATE INDEX idx_request_logs_request_id ON request_logs (request_id);
CREATE INDEX idx_request_logs_created ON request_logs (created_at);
CREATE INDEX idx_request_logs_success ON request_logs (success);

-- =============================================
-- TABLE 7: Error Logs
-- Error tracking
-- =============================================
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for error_logs
CREATE INDEX idx_error_logs_request_id ON error_logs (request_id);
CREATE INDEX idx_error_logs_created ON error_logs (created_at);
CREATE INDEX idx_error_logs_type ON error_logs (error_type);

-- =============================================
-- TABLE 8: Events (Business Metrics)
-- Track business events
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_events_name ON events (event_name);
CREATE INDEX idx_events_created ON events (created_at);

-- =============================================
-- CLEANUP FUNCTION
-- Automatically delete expired cache entries
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily)
-- Note: Use Supabase Edge Functions or pg_cron for scheduling

-- =============================================
-- ROW LEVEL SECURITY (Optional)
-- Enable if you want user-level data isolation
-- =============================================

-- Enable RLS on user_queries
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own queries
CREATE POLICY user_queries_policy ON user_queries
  FOR ALL
  USING (auth.uid()::text = user_id);

-- =============================================
-- VIEWS (Optional)
-- Helpful for analytics
-- =============================================

-- View: Daily cost summary
CREATE OR REPLACE VIEW daily_costs AS
SELECT 
  DATE(created_at) as date,
  service,
  SUM(cost) as total_cost,
  COUNT(*) as request_count
FROM cost_tracking
GROUP BY DATE(created_at), service
ORDER BY date DESC, total_cost DESC;

-- View: Performance summary
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  AVG(total_duration_ms) as avg_duration_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_duration_ms) as p50_duration_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_duration_ms) as p95_duration_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY total_duration_ms) as p99_duration_ms,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as success_rate
FROM request_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Error summary
CREATE OR REPLACE VIEW error_summary AS
SELECT 
  DATE(created_at) as date,
  error_type,
  COUNT(*) as error_count,
  array_agg(DISTINCT error_message) as sample_messages
FROM error_logs
GROUP BY DATE(created_at), error_type
ORDER BY date DESC, error_count DESC;

-- =============================================
-- GRANTS (If using service role)
-- =============================================

-- Grant permissions for service role
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables: product_cache, user_queries, cached_bundles, cost_tracking, cache, request_logs, error_logs, events';
  RAISE NOTICE '🔍 Indexes: Created for optimal performance';
  RAISE NOTICE '👁️  Views: daily_costs, performance_summary, error_summary';
END $$;
