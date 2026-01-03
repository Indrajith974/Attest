import db from '../db/database.js';

/**
 * Calculate confidence score for a claim
 * 
 * IMPROVED Scoring methodology (more flexible):
 * - Base score: 30 (just for creating a claim)
 * - Evidence: +15 for first evidence, +5 for each additional (max +30)
 * - Witness confirmations: +20 for first, +10 for each additional (max +40)
 * - Partial confirmations: +10 each (max +20)
 * - Denials: -25 each
 * - Bonus: +10 if multiple unique witnesses confirm
 * - Capped at 0-100
 */
export function calculateConfidenceScore(claimId) {
    // Get witness responses
    const responses = db.prepare(`
        SELECT response_type, COUNT(*) as count 
        FROM witness_responses 
        WHERE claim_id = ? 
        GROUP BY response_type
    `).all(claimId);

    // Get evidence count
    const evidenceResult = db.prepare(`
        SELECT COUNT(*) as count FROM evidence WHERE claim_id = ?
    `).get(claimId);

    const evidenceCount = evidenceResult?.count || 0;

    // Count responses by type
    let confirmCount = 0;
    let partialCount = 0;
    let denyCount = 0;

    for (const r of responses) {
        if (r.response_type === 'CONFIRM') confirmCount = r.count;
        else if (r.response_type === 'PARTIAL') partialCount = r.count;
        else if (r.response_type === 'DENY') denyCount = r.count;
    }

    // Calculate score
    let score = 30; // Base score for creating a claim

    // Evidence bonus (more generous)
    // First evidence: +15, each additional: +5, max +30
    let evidenceBonus = 0;
    if (evidenceCount > 0) {
        evidenceBonus = 15 + Math.min((evidenceCount - 1) * 5, 15);
    }
    score += evidenceBonus;

    // Confirmation bonus (more generous)
    // First confirm: +20, each additional: +10, max +40
    let confirmBonus = 0;
    if (confirmCount > 0) {
        confirmBonus = 20 + Math.min((confirmCount - 1) * 10, 20);
    }
    score += confirmBonus;

    // Partial confirmation bonus
    // Each partial: +10, max +20
    const partialBonus = Math.min(partialCount * 10, 20);
    score += partialBonus;

    // Diversity bonus: if claim has both evidence AND confirmations
    let diversityBonus = 0;
    if (evidenceCount > 0 && confirmCount > 0) {
        diversityBonus = 10;
    }
    score += diversityBonus;

    // Deny penalty (harsh but fair)
    const denyPenalty = denyCount * 25;
    score -= denyPenalty;

    // Cap at 0-100
    score = Math.max(0, Math.min(100, score));

    // Return score with breakdown for transparency
    return {
        score,
        breakdown: {
            base: 30,
            evidenceCount,
            evidenceBonus,
            confirmCount,
            confirmBonus,
            partialCount,
            partialBonus,
            diversityBonus,
            denyCount,
            denyPenalty
        },
        explanation: generateExplanation(score, {
            evidenceCount,
            evidenceBonus,
            confirmCount,
            confirmBonus,
            partialCount,
            partialBonus,
            diversityBonus,
            denyCount,
            denyPenalty
        })
    };
}

function generateExplanation(score, breakdown) {
    const parts = ['Base: 30'];

    if (breakdown.evidenceBonus > 0) {
        parts.push(`+${breakdown.evidenceBonus} for ${breakdown.evidenceCount} evidence file(s)`);
    }
    if (breakdown.confirmBonus > 0) {
        parts.push(`+${breakdown.confirmBonus} from ${breakdown.confirmCount} confirmation(s)`);
    }
    if (breakdown.partialBonus > 0) {
        parts.push(`+${breakdown.partialBonus} from ${breakdown.partialCount} partial confirmation(s)`);
    }
    if (breakdown.diversityBonus > 0) {
        parts.push(`+${breakdown.diversityBonus} diversity bonus`);
    }
    if (breakdown.denyPenalty > 0) {
        parts.push(`-${breakdown.denyPenalty} from ${breakdown.denyCount} denial(s)`);
    }

    parts.push(`= ${score}%`);

    return parts.join(' • ');
}

export default { calculateConfidenceScore };
