import express from 'express';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/analytics
 * Get analytics data for the authenticated user
 */
router.get('/', requireAuth, (req, res) => {
    try {
        const userId = req.session.userId;

        // Total claims
        const totalClaims = db.prepare(`
            SELECT COUNT(*) as count FROM claims WHERE user_id = ?
        `).get(userId).count;

        // Claims by category
        const claimsByCategory = db.prepare(`
            SELECT category, COUNT(*) as count 
            FROM claims 
            WHERE user_id = ? 
            GROUP BY category
            ORDER BY count DESC
        `).all(userId);

        // Total witness responses
        const totalResponses = db.prepare(`
            SELECT COUNT(*) as count 
            FROM witness_responses wr
            JOIN claims c ON wr.claim_id = c.id
            WHERE c.user_id = ?
        `).get(userId).count;

        // Responses by type
        const responsesByType = db.prepare(`
            SELECT wr.response_type, COUNT(*) as count 
            FROM witness_responses wr
            JOIN claims c ON wr.claim_id = c.id
            WHERE c.user_id = ?
            GROUP BY wr.response_type
        `).all(userId);

        // Total evidence files
        const totalEvidence = db.prepare(`
            SELECT COUNT(*) as count 
            FROM evidence e
            JOIN claims c ON e.claim_id = c.id
            WHERE c.user_id = ?
        `).get(userId).count;

        // Average confidence score
        const claims = db.prepare(`
            SELECT id FROM claims WHERE user_id = ?
        `).all(userId);

        let avgConfidence = 0;
        if (claims.length > 0) {
            // Import confidence calculation inline to avoid circular deps
            const scores = claims.map(claim => {
                const responses = db.prepare(`
                    SELECT response_type FROM witness_responses WHERE claim_id = ?
                `).all(claim.id);

                const evidenceCount = db.prepare(`
                    SELECT COUNT(*) as count FROM evidence WHERE claim_id = ?
                `).get(claim.id).count;

                let score = 40;
                responses.forEach(r => {
                    if (r.response_type === 'CONFIRM') score += 15;
                    else if (r.response_type === 'PARTIAL') score += 5;
                    else if (r.response_type === 'DENY') score -= 20;
                });
                score += Math.min(evidenceCount * 5, 20);
                return Math.min(Math.max(score, 0), 100);
            });
            avgConfidence = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }

        // Recent activity (last 10 items)
        const recentActivity = db.prepare(`
            SELECT al.action, al.entity_type, al.timestamp, al.details
            FROM audit_log al
            JOIN claims c ON (al.entity_type = 'claim' AND al.entity_id = c.id)
            WHERE c.user_id = ?
            UNION
            SELECT al.action, al.entity_type, al.timestamp, al.details
            FROM audit_log al
            JOIN witness_responses wr ON (al.entity_type = 'witness_response' AND al.entity_id = wr.id)
            JOIN claims c ON wr.claim_id = c.id
            WHERE c.user_id = ?
            ORDER BY timestamp DESC
            LIMIT 10
        `).all(userId, userId);

        // Claims over time (last 6 months)
        const claimsOverTime = db.prepare(`
            SELECT 
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as count
            FROM claims 
            WHERE user_id = ? 
                AND created_at >= date('now', '-6 months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month ASC
        `).all(userId);

        res.json({
            analytics: {
                summary: {
                    totalClaims,
                    totalResponses,
                    totalEvidence,
                    avgConfidence
                },
                claimsByCategory,
                responsesByType: responsesByType.reduce((acc, r) => {
                    acc[r.response_type.toLowerCase()] = r.count;
                    return acc;
                }, { confirm: 0, partial: 0, deny: 0 }),
                claimsOverTime,
                recentActivity: recentActivity.map(a => ({
                    action: a.action,
                    entityType: a.entity_type,
                    timestamp: a.timestamp,
                    details: a.details ? JSON.parse(a.details) : null
                }))
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
