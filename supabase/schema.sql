-- ============================================
-- BUNDLEUP - INTENT-TO-SOLUTION ARCHITECTURE
-- Database Schema for Supabase/PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILE STORE
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

CREATE TABLE user_project_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_type VARCHAR(100) NOT NULL,
  checklist JSONB NOT NULL,
  selected_products JSONB,
  total_spent DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. COMPATIBILITY GRAPH (Graph Database)
-- ============================================

-- Product categories and their specifications
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  parent_category_id UUID REFERENCES product_categories(id),
  required_specs JSONB NOT NULL, -- e.g., {"HDMI_version": "string", "resolution": "string"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compatibility rules between product types
CREATE TABLE compatibility_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name VARCHAR(200) NOT NULL,
  category_a_id UUID REFERENCES product_categories(id),
  category_b_id UUID REFERENCES product_categories(id),
  rule_type VARCHAR(50) NOT NULL, -- "REQUIRES", "COMPATIBLE_IF", "INCOMPATIBLE_IF"
  conditions JSONB NOT NULL, -- e.g., {"HDMI_version_a": ">=2.1", "HDMI_version_b": ">=2.1"}
  severity VARCHAR(20) DEFAULT 'ERROR', -- "ERROR", "WARNING", "INFO"
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standard specifications database
CREATE TABLE standard_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES product_categories(id),
  spec_name VARCHAR(100) NOT NULL,
  spec_type VARCHAR(50) NOT NULL, -- "VERSION", "MEASUREMENT", "BOOLEAN", "ENUM"
  valid_values JSONB, -- For enums: ["HDMI 2.0", "HDMI 2.1"], for versions: null
  unit VARCHAR(20), -- "watts", "ohms", "inches"
  comparison_operator VARCHAR(10), -- ">=", "<=", "==", "in"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. KNOWLEDGE BASE (Heuristics & Rules)
-- ============================================

CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_type VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- "home_theater", "gaming", "diy", etc.
  template_items JSONB NOT NULL, -- Structured checklist template
  priority_order JSONB NOT NULL, -- Item dependency graph
  estimated_budget_range JSONB, -- {"min": 500, "max": 5000}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE heuristics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heuristic_name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  rule_description TEXT NOT NULL,
  conditions JSONB NOT NULL,
  recommendation JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.8, -- 0.0 to 1.0
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review signals and quality indicators
CREATE TABLE review_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(200) NOT NULL,
  retailer VARCHAR(100) NOT NULL,
  average_rating DECIMAL(3,2),
  review_count INTEGER,
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  common_complaints JSONB, -- ["breaks easily", "poor customer service"]
  quality_score DECIMAL(3,2), -- 0.0 to 1.0
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. CATALOG ADAPTER (Product Data Cache)
-- ============================================

CREATE TABLE product_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(200) UNIQUE NOT NULL,
  retailer VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  normalized_specs JSONB, -- Standardized specifications
  raw_specs JSONB, -- Original product specifications
  image_url TEXT,
  product_url TEXT NOT NULL,
  availability BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast product lookups
CREATE INDEX idx_product_cache_retailer ON product_cache(retailer);
CREATE INDEX idx_product_cache_price ON product_cache(price);
CREATE INDEX idx_product_cache_updated ON product_cache(last_updated);

-- ============================================
-- 5. ROADMAP & OPTIMIZATION TRACKING
-- ============================================

CREATE TABLE user_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  original_intent TEXT NOT NULL,
  parsed_components JSONB NOT NULL, -- Decomposed requirements
  generated_roadmap JSONB NOT NULL, -- Ordered solution blueprint
  optimization_preferences JSONB, -- {"priority": "price", "quality_weight": 0.7}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE solution_alternatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  alternative_rank INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  quality_score DECIMAL(3,2) NOT NULL,
  compatibility_score DECIMAL(3,2) NOT NULL,
  bundle_composition JSONB NOT NULL, -- Complete product list
  tradeoffs TEXT, -- Explanation of tradeoffs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. TELEMETRY & METRICS (A/B Testing)
-- ============================================

CREATE TABLE conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- "search", "checklist_generated", "product_clicked", "purchase"
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ab_test_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name VARCHAR(100) NOT NULL,
  variant_name VARCHAR(50) NOT NULL,
  variant_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_name, variant_name)
);

CREATE TABLE ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_name VARCHAR(100) NOT NULL,
  variant_name VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, test_name)
);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_user_history_user ON user_project_history(user_id);
CREATE INDEX idx_compatibility_categories ON compatibility_rules(category_a_id, category_b_id);
CREATE INDEX idx_roadmaps_user ON user_roadmaps(user_id);
CREATE INDEX idx_roadmaps_session ON user_roadmaps(session_id);
CREATE INDEX idx_conversion_events_user ON conversion_events(user_id);
CREATE INDEX idx_conversion_events_session ON conversion_events(session_id);
CREATE INDEX idx_conversion_events_type ON conversion_events(event_type);

-- ============================================
-- 8. SEED DATA - Home Theater Category
-- ============================================

-- Insert home theater category
INSERT INTO product_categories (name, required_specs) VALUES
('home_theater_receiver', '{"HDMI_version": "string", "channels": "string", "wattage_per_channel": "number", "impedance": "string"}'),
('speakers', '{"impedance": "string", "frequency_response": "string", "sensitivity": "number", "wattage": "number"}'),
('subwoofer', '{"impedance": "string", "wattage": "number", "frequency_response": "string"}'),
('tv', '{"HDMI_version": "string", "resolution": "string", "screen_size": "number", "HDR_support": "boolean"}'),
('hdmi_cable', '{"HDMI_version": "string", "length": "number"}');

-- Insert compatibility rules
INSERT INTO compatibility_rules (rule_name, rule_type, conditions, severity, explanation)
VALUES
('HDMI_Version_Match', 'COMPATIBLE_IF', '{"HDMI_version_min": "2.0"}', 'WARNING', 'For 4K content, all HDMI devices should support HDMI 2.0 or higher'),
('Speaker_Impedance_Match', 'COMPATIBLE_IF', '{"receiver_impedance": ">=speaker_impedance"}', 'ERROR', 'Receiver must support speaker impedance to avoid damage'),
('Wattage_Match', 'COMPATIBLE_IF', '{"receiver_wattage": ">=speaker_wattage"}', 'WARNING', 'Receiver should provide adequate power for speakers');

-- Insert home theater template
INSERT INTO project_templates (project_type, category, template_items, priority_order, estimated_budget_range)
VALUES
('home_theater', 'home_theater', 
 '[
   {"item": "AV Receiver", "category": "home_theater_receiver", "priority": "essential", "quantity": 1},
   {"item": "TV", "category": "tv", "priority": "essential", "quantity": 1},
   {"item": "Front Speakers", "category": "speakers", "priority": "essential", "quantity": 2},
   {"item": "Center Speaker", "category": "speakers", "priority": "recommended", "quantity": 1},
   {"item": "Subwoofer", "category": "subwoofer", "priority": "recommended", "quantity": 1},
   {"item": "HDMI Cables", "category": "hdmi_cable", "priority": "essential", "quantity": 3}
 ]',
 '{"dependencies": {"speakers": ["home_theater_receiver"], "hdmi_cable": ["home_theater_receiver", "tv"]}}',
 '{"min": 1500, "max": 5000}'
);

-- ============================================
-- 9. VIEWS FOR ANALYTICS
-- ============================================

CREATE VIEW conversion_funnel AS
SELECT 
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users
FROM conversion_events
GROUP BY event_type
ORDER BY 
  CASE event_type
    WHEN 'search' THEN 1
    WHEN 'checklist_generated' THEN 2
    WHEN 'products_shown' THEN 3
    WHEN 'product_clicked' THEN 4
    WHEN 'purchase' THEN 5
  END;

CREATE VIEW user_lifetime_value AS
SELECT 
  user_id,
  COUNT(*) as total_projects,
  SUM(total_spent) as lifetime_value,
  AVG(total_spent) as avg_project_value
FROM user_project_history
GROUP BY user_id;
