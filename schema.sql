-- =========================================================================
-- LEAD ENGINE v1 - MASTER DATABASE INITIALIZATION SCHEMA
-- Includes Idempotency, Fallback Scraping & Velocity Auditing
-- =========================================================================

-- 1. LEAD REGISTRY (Raw Inbound Catchment)
CREATE TABLE lead_registry (
    lead_id TEXT PRIMARY KEY,
    first_name TEXT,
    email TEXT NOT NULL,
    intent_signal TEXT NOT NULL,
    honeypot_bypass TEXT NOT NULL,
    extracted_domain TEXT,
    is_enterprise_domain BOOLEAN NOT NULL DEFAULT FALSE,
    domain_system_warning TEXT,
    captured_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL
);

CREATE INDEX idx_lead_registry_email
ON lead_registry(email);

CREATE INDEX idx_lead_registry_domain
ON lead_registry(extracted_domain);

CREATE INDEX idx_lead_registry_enterprise
ON lead_registry(is_enterprise_domain);


-- 2. FAILED LEAD REGISTRY (Dead-letter Queue & Audit Log)
CREATE TABLE failed_lead_registry (
    lead_id TEXT PRIMARY KEY,
    first_name TEXT,
    email TEXT,
    intent_signal TEXT,
    captured_at TIMESTAMPTZ NOT NULL,
    failure_reason TEXT NOT NULL,
    status TEXT NOT NULL
);

CREATE INDEX idx_failed_email
ON failed_lead_registry(email);

CREATE INDEX idx_failed_timestamp
ON failed_lead_registry(captured_at);


-- 3. EVENT IDEMPOTENCY (Velocity, Deduplication & Heat Tracking)
CREATE TABLE IF NOT EXISTS event_idempotency (
    -- Primary Identifier (Static 1-row-per-email)
    email VARCHAR(255) PRIMARY KEY,
    
    -- Mathematical State Variables
    last_intent_rank INT NOT NULL DEFAULT 1,
    last_intent_signal VARCHAR(255) NOT NULL,
    heat_score INT NOT NULL DEFAULT 0,                 -- Added for Heat Math
    last_outreach_at TIMESTAMPTZ NULL,                 -- Used for Cooldown Check
    last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- Used for Delta t (Velocity)
    total_touchpoints INT NOT NULL DEFAULT 1,           -- Touchpoint Counter
    
    -- Execution State Record
    last_status VARCHAR(50),
    last_sub_reason VARCHAR(50),
    
    -- System Audit Timestamps
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_idempotency_email ON event_idempotency(email);


-- 4. ACTIVE LEADS (Enriched, Scored & Tiered Workspace)
DROP TABLE IF EXISTS active_leads CASCADE;

CREATE TABLE active_leads (
    lead_id TEXT PRIMARY KEY,
    first_name TEXT,
    email TEXT NOT NULL,
    allocated_tier TEXT NOT NULL,
    total_score INTEGER NOT NULL DEFAULT 0,
    is_priority_override BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason TEXT,
    intent_signal TEXT,
    company_name TEXT,
    employee_count INTEGER NOT NULL DEFAULT 0,
    annual_revenue BIGINT NOT NULL DEFAULT 0,
    funding_stage TEXT,
    industry TEXT,
    company_description TEXT,
    raw_meta_summary TEXT,
    enrichment_source TEXT DEFAULT 'UNKNOWN',
    enrichment_success BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    apollo_verification_status TEXT,
    company_keywords TEXT
);

-- Performance Indexes
CREATE INDEX idx_active_tier ON active_leads(allocated_tier);
CREATE INDEX idx_active_score ON active_leads(total_score);
CREATE INDEX idx_active_email ON active_leads(email);
CREATE INDEX idx_active_company ON active_leads(company_name);


-- 5. ARCHIVE (Processed / Cold Storage)
DROP TABLE IF EXISTS archived_leads CASCADE;

CREATE TABLE archived_leads (
    lead_id TEXT PRIMARY KEY,
    first_name TEXT,
    email TEXT NOT NULL,
    allocated_tier TEXT NOT NULL,
    total_score INTEGER NOT NULL DEFAULT 0,
    override_reason TEXT,
    intent_signal TEXT,
    company_name TEXT,
    enrichment_source TEXT DEFAULT 'UNKNOWN',
    timestamp TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_archive_status ON archived_leads(status);
CREATE INDEX idx_archive_email ON archived_leads(email);