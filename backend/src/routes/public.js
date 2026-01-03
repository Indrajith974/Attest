import express from 'express';
import db from '../db/database.js';
import { calculateConfidenceScore } from '../services/confidence.js';
import { getClaimAuditTrail } from '../services/audit.js';
import { generateProofPDF } from '../services/pdf.js';
import { generateQRCode, generateQRCodeBuffer } from '../services/qrcode.js';

const router = express.Router();

/**
 * GET /api/proof/:claimId
 * Public read-only proof page data
 */
router.get('/:claimId', (req, res) => {
    try {
        // Get claim with claimant info
        const claim = db.prepare(`
            SELECT c.id, c.title, c.description, c.category, c.start_date, c.end_date, c.created_at,
                   u.name as claimant_name
            FROM claims c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `).get(req.params.claimId);

        if (!claim) {
            return res.status(404).json({ error: 'Proof not found' });
        }

        // Get evidence (metadata only, files served separately)
        const evidence = db.prepare(`
            SELECT id, file_type, original_name, uploaded_at 
            FROM evidence 
            WHERE claim_id = ?
            ORDER BY uploaded_at ASC
        `).all(claim.id);

        // Get witness responses (public info only)
        const responses = db.prepare(`
            SELECT id, name, relationship, response_type, comment, created_at 
            FROM witness_responses 
            WHERE claim_id = ?
            ORDER BY created_at ASC
        `).all(claim.id);

        // Get response counts
        const responseCounts = {
            confirm: responses.filter(r => r.response_type === 'CONFIRM').length,
            partial: responses.filter(r => r.response_type === 'PARTIAL').length,
            deny: responses.filter(r => r.response_type === 'DENY').length,
            total: responses.length
        };

        // Get confidence score with full breakdown
        const confidence = calculateConfidenceScore(claim.id);

        // Get audit trail for timeline
        const auditTrail = getClaimAuditTrail(claim.id);

        // Build timeline from audit trail
        const timeline = auditTrail.map(entry => ({
            id: entry.id,
            action: entry.action,
            entityType: entry.entity_type,
            timestamp: entry.timestamp,
            details: entry.details ? JSON.parse(entry.details) : null
        }));

        res.json({
            proof: {
                claim: {
                    id: claim.id,
                    title: claim.title,
                    description: claim.description,
                    category: claim.category,
                    startDate: claim.start_date,
                    endDate: claim.end_date,
                    createdAt: claim.created_at,
                    claimantName: claim.claimant_name || 'Anonymous'
                },
                evidence: evidence.map(e => ({
                    id: e.id,
                    type: e.file_type,
                    name: e.original_name,
                    uploadedAt: e.uploaded_at
                })),
                responses,
                responseCounts,
                confidence,
                timeline,
                disclaimer: 'This is NOT a legal or government certificate. This is a personal truth-recording system based on human witness verification.'
            }
        });
    } catch (error) {
        console.error('Get public proof error:', error);
        res.status(500).json({ error: 'Failed to fetch proof' });
    }
});

/**
 * GET /api/proof/:claimId/evidence/:evidenceId
 * Get evidence file for public proof
 */
router.get('/:claimId/evidence/:evidenceId', (req, res) => {
    try {
        const evidence = db.prepare(`
            SELECT e.* FROM evidence e
            WHERE e.id = ? AND e.claim_id = ?
        `).get(req.params.evidenceId, req.params.claimId);

        if (!evidence) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        const filePath = `${process.cwd()}/uploads/${evidence.file_path}`;
        res.sendFile(filePath);
    } catch (error) {
        console.error('Get public evidence error:', error);
        res.status(500).json({ error: 'Failed to fetch evidence' });
    }
});

/**
 * GET /api/proof/:claimId/pdf
 * Generate and download PDF proof document
 */
router.get('/:claimId/pdf', async (req, res) => {
    try {
        const claim = db.prepare('SELECT id FROM claims WHERE id = ?').get(req.params.claimId);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const pdfBuffer = await generateProofPDF(req.params.claimId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="lifeproof-${req.params.claimId.slice(0, 8)}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

/**
 * GET /api/proof/:claimId/qr
 * Generate QR code for proof page
 */
router.get('/:claimId/qr', async (req, res) => {
    try {
        const claim = db.prepare('SELECT id FROM claims WHERE id = ?').get(req.params.claimId);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const proofUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/proof/${req.params.claimId}`;

        if (req.query.format === 'png') {
            const buffer = await generateQRCodeBuffer(proofUrl);
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            const dataUrl = await generateQRCode(proofUrl);
            res.json({ qrCode: dataUrl, url: proofUrl });
        }
    } catch (error) {
        console.error('Generate QR error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

export default router;
