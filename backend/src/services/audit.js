import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

/**
 * Log an action to the audit trail
 * Audit log is append-only and immutable
 */
export function logAudit(entityType, entityId, action, details = null, actorId = null) {
    const stmt = db.prepare(`
        INSERT INTO audit_log (id, entity_type, entity_id, action, details, actor_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const id = uuidv4();
    stmt.run(id, entityType, entityId, action, details ? JSON.stringify(details) : null, actorId);

    return id;
}

/**
 * Get audit trail for an entity
 */
export function getAuditTrail(entityType, entityId) {
    const stmt = db.prepare(`
        SELECT * FROM audit_log 
        WHERE entity_type = ? AND entity_id = ?
        ORDER BY timestamp ASC
    `);

    return stmt.all(entityType, entityId);
}

/**
 * Get all audit entries for a claim and its related entities
 */
export function getClaimAuditTrail(claimId) {
    const stmt = db.prepare(`
        SELECT * FROM audit_log 
        WHERE (entity_type = 'claim' AND entity_id = ?)
           OR (entity_type = 'evidence' AND entity_id IN (SELECT id FROM evidence WHERE claim_id = ?))
           OR (entity_type = 'witness_invite' AND entity_id IN (SELECT id FROM witness_invites WHERE claim_id = ?))
           OR (entity_type = 'witness_response' AND entity_id IN (SELECT id FROM witness_responses WHERE claim_id = ?))
        ORDER BY timestamp ASC
    `);

    return stmt.all(claimId, claimId, claimId, claimId);
}

export default { logAudit, getAuditTrail, getClaimAuditTrail };
