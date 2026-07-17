-- DebugBit Enterprise SaaS Platform - PostgreSQL Schema Database Migrations
-- Target Database: PostgreSQL v14+ / Supabase DB

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. USERS TABLE (Handled or mirrored from Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Maps directly to auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. TEAM MEMBERSHIPS
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- 'owner', 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(team_id, user_id)
);

-- 4. PROJECTS (An API Key connects the Chrome Extension to a SaaS Project)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL, -- Public key used for sync telemetry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create an index on API key for fast lookups during sync handshakes
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);

-- 5. SESSIONS (Directly mirrors local-first Chrome DevTools debugging sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY, -- Matches the unique client-side UUID
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tab_id INT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL, -- 'active', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create session indices
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time DESC);

-- 6. CONSOLE LOGS TELEMETRY
CREATE TABLE IF NOT EXISTS console_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'log', 'info', 'warn', 'error', 'exception'
    message TEXT NOT NULL,
    stack TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_console_logs_session_id ON console_logs(session_id);

-- 7. NETWORK LOGS TELEMETRY
CREATE TABLE IF NOT EXISTS network_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    method VARCHAR(10) NOT NULL, -- 'GET', 'POST', etc.
    url TEXT NOT NULL,
    status INT NOT NULL,
    duration INT NOT NULL, -- in milliseconds
    request_headers JSONB,
    response_headers JSONB,
    request_body TEXT,
    response_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_network_logs_session_id ON network_logs(session_id);

-- 8. PERFORMANCE METRICS
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- 'FCP', 'LCP', etc.
    value NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_session_id ON performance_metrics(session_id);

-- 9. AI DIAGNOSTIC REPORTS
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    model_used VARCHAR(100) NOT NULL, -- 'gemini-2.5-flash', etc.
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(session_id) -- Only allow one master report per debugging session
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_session_id ON ai_reports(session_id);
