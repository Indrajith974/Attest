-- Attest Database Schema
-- IMMUTABLE BY DESIGN: No UPDATE or DELETE operations on claims/responses

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- OTP tokens for authentication
CREATE TABLE IF NOT EXISTS otp_tokens (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Claims table (IMMUTABLE)
CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Residence', 'Employment', 'Dependency', 'Education', 'Other')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    locked INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT,
    file_base64 TEXT,
    original_name TEXT,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (claim_id) REFERENCES claims(id)
);

-- Witness invitations
CREATE TABLE IF NOT EXISTS witness_invites (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    used INTEGER DEFAULT 0,
    FOREIGN KEY (claim_id) REFERENCES claims(id)
);

-- Witness responses (IMMUTABLE)
CREATE TABLE IF NOT EXISTS witness_responses (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    invite_id TEXT,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('CONFIRM', 'PARTIAL', 'DENY')),
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    immutable INTEGER DEFAULT 1,
    FOREIGN KEY (claim_id) REFERENCES claims(id),
    FOREIGN KEY (invite_id) REFERENCES witness_invites(id)
);

-- Audit log (append-only)
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    actor_id TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_claim_id ON evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_witness_invites_claim_id ON witness_invites(claim_id);
CREATE INDEX IF NOT EXISTS idx_witness_invites_token ON witness_invites(token);
CREATE INDEX IF NOT EXISTS idx_witness_responses_claim_id ON witness_responses(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Triggers to enforce immutability (prevent updates and deletes)
CREATE TRIGGER IF NOT EXISTS prevent_claim_update
    BEFORE UPDATE ON claims
    BEGIN
        SELECT RAISE(ABORT, 'Claims are immutable and cannot be updated');
    END;

CREATE TRIGGER IF NOT EXISTS prevent_claim_delete
    BEFORE DELETE ON claims
    BEGIN
        SELECT RAISE(ABORT, 'Claims are immutable and cannot be deleted');
    END;

CREATE TRIGGER IF NOT EXISTS prevent_witness_response_update
    BEFORE UPDATE ON witness_responses
    BEGIN
        SELECT RAISE(ABORT, 'Witness responses are immutable and cannot be updated');
    END;

CREATE TRIGGER IF NOT EXISTS prevent_witness_response_delete
    BEFORE DELETE ON witness_responses
    BEGIN
        SELECT RAISE(ABORT, 'Witness responses are immutable and cannot be deleted');
    END;

CREATE TRIGGER IF NOT EXISTS prevent_audit_log_update
    BEFORE UPDATE ON audit_log
    BEGIN
        SELECT RAISE(ABORT, 'Audit log is immutable and cannot be updated');
    END;

CREATE TRIGGER IF NOT EXISTS prevent_audit_log_delete
    BEFORE DELETE ON audit_log
    BEGIN
        SELECT RAISE(ABORT, 'Audit log is immutable and cannot be deleted');
    END;
