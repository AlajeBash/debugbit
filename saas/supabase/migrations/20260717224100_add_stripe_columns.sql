-- ====================================================================
-- DebugBit v2.0 Enterprise SaaS - Stripe Subscription Schema Alteration
-- Adds customer profiling, subscription, and planning columns
-- ====================================================================

-- 1. Add columns to 'users' table (for personal sandboxes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50) DEFAULT 'community';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- Create lookup index for users customer IDs
CREATE INDEX IF NOT EXISTS idx_users_stripe_cust ON users(stripe_customer_id);

-- 2. Add columns to 'teams' table (for multi-tenant organizations)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50) DEFAULT 'community';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- Create lookup index for teams customer IDs
CREATE INDEX IF NOT EXISTS idx_teams_stripe_cust ON teams(stripe_customer_id);
