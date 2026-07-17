-- ====================================================================
-- DebugBit v2.0 Enterprise SaaS Database Schema Migration
-- Designed for Supabase PostgreSQL (Supports Clerk identities & Sync)
-- ====================================================================

-- 1. Users Profile (Mirrored from Clerk signups)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Clerk User ID (e.g., 'user_2N...')
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Teams / Organizations (Mirrored from Clerk organizations)
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(255) PRIMARY KEY, -- Clerk Org ID (e.g., 'org_2N...')
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Team Members Join Table (Supports RBAC)
CREATE TABLE IF NOT EXISTS team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id VARCHAR(255) REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- 'owner', 'admin', 'member'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(team_id, user_id)
);

-- 4. Projects (Workspaces within an organization)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(255) REFERENCES teams(id) ON DELETE CASCADE, -- Nullable for personal developer sandbox accounts
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Personal sandbox owner
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL, -- Client-side token used inside Extension Settings to Sync
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing API Keys for rapid telemetry authentication checks
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);

-- 5. Sessions (Root telemetry collector entity)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY, -- Standardized UUID from client-side Dexie
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Optional matching project link
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- Personal developer link
    tab_id INT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for active/recent timeline sessions querying
CREATE INDEX IF NOT EXISTS idx_sessions_project_time ON sessions(project_id, start_time DESC);

-- 6. Console Logs (Nested telemetry arrays)
CREATE TABLE IF NOT EXISTS console_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'log', 'info', 'warn', 'error', 'exception'
    message TEXT NOT NULL,
    stack TEXT
);

CREATE INDEX IF NOT EXISTS idx_console_logs_session ON console_logs(session_id, timestamp ASC);

-- 7. Network Logs (HTTP transaction telemetry)
CREATE TABLE IF NOT EXISTS network_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    status INT NOT NULL,
    duration INT NOT NULL, -- transit milliseconds
    request_headers JSONB,
    response_headers JSONB,
    request_body TEXT,
    response_body TEXT
);

CREATE INDEX IF NOT EXISTS idx_network_logs_session ON network_logs(session_id, timestamp ASC);

-- 8. Performance Metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    metric_name VARCHAR(100) NOT NULL, -- 'FCP', 'LCP', 'DOMContentLoaded', etc.
    value NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_perf_metrics_session ON performance_metrics(session_id);

-- 9. AI Diagnostics Reports
CREATE TABLE IF NOT EXISTS ai_reports (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
    model_used VARCHAR(100) NOT NULL, -- 'gemini-1.5-pro', 'gpt-4o', etc.
    content TEXT NOT NULL, -- Markdown analysis report
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_session ON ai_reports(session_id);

-- 10. Audit Logs (Enterprise security tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    team_id VARCHAR(255) REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'API_KEY_ROTATED', 'SESSION_PURGED'
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_team ON audit_logs(team_id, created_at DESC);
