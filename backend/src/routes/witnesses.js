import express from 'express';
import multer from 'multer';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { logAudit } from '../services/audit.js';
import { notifyWitnessResponse } from '../services/email.js';

const router = express.Router();

// Configure multer for witness evidence uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'witness');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `witness-${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for witness evidence
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
        }
    }
});

/**
 * GET /api/witness/:token
 * Get claim info for witness (no auth required)
 */
router.get('/:token', (req, res) => {
    try {
        const invite = db.prepare(`
            SELECT * FROM witness_invites WHERE token = ?
        `).get(req.params.token);

        if (!invite) {
            return res.status(404).json({ error: 'Invalid or expired invitation link' });
        }

        if (invite.used) {
            return res.status(410).json({ error: 'This invitation has already been used' });
        }

        // Get claim info (limited details for witnesses)
        const claim = db.prepare(`
            SELECT c.id, c.title, c.description, c.category, c.start_date, c.end_date, c.created_at,
                   u.name as claimant_name, u.email as claimant_email
            FROM claims c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `).get(invite.claim_id);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json({
            claim: {
                id: claim.id,
                title: claim.title,
                description: claim.description,
                category: claim.category,
                startDate: claim.start_date,
                endDate: claim.end_date,
                createdAt: claim.created_at,
                claimantName: claim.claimant_name || claim.claimant_email.split('@')[0]
            }
        });
    } catch (error) {
        console.error('Get witness claim error:', error);
        res.status(500).json({ error: 'Failed to fetch claim' });
    }
});

/**
 * POST /api/witness/:token
 * Submit witness response with optional evidence (one-time use, IMMUTABLE)
 */
router.post('/:token', upload.single('evidence'), (req, res) => {
    try {
        const { name, relationship, responseType, comment } = req.body;

        // Validation
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }
        if (!relationship || relationship.trim().length < 2) {
            return res.status(400).json({ error: 'Relationship is required' });
        }
        if (!responseType || !['CONFIRM', 'PARTIAL', 'DENY'].includes(responseType)) {
            return res.status(400).json({ error: 'Invalid response type' });
        }

        // Get invite
        const invite = db.prepare(`
            SELECT * FROM witness_invites WHERE token = ?
        `).get(req.params.token);

        if (!invite) {
            return res.status(404).json({ error: 'Invalid or expired invitation link' });
        }

        if (invite.used) {
            return res.status(410).json({ error: 'This invitation has already been used' });
        }

        // Create response (IMMUTABLE)
        const responseId = uuidv4();

        const stmt = db.prepare(`
            INSERT INTO witness_responses (id, claim_id, invite_id, name, relationship, response_type, comment, created_at, immutable)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 1)
        `);

        stmt.run(
            responseId,
            invite.claim_id,
            invite.id,
            name.trim(),
            relationship.trim(),
            responseType,
            comment ? comment.trim() : null
        );

        // Handle witness evidence if uploaded
        let evidenceInfo = null;
        if (req.file) {
            const evidenceId = uuidv4();

            db.prepare(`
                INSERT INTO evidence (id, claim_id, file_type, file_path, original_name, uploaded_at, witness_response_id)
                VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
            `).run(
                evidenceId,
                invite.claim_id,
                req.file.mimetype,
                `witness/${req.file.filename}`,
                req.file.originalname,
                responseId
            );

            evidenceInfo = {
                id: evidenceId,
                fileName: req.file.originalname
            };

            logAudit('witness_evidence', evidenceId, 'UPLOADED', {
                claimId: invite.claim_id,
                responseId,
                fileName: req.file.originalname
            }, null);
        }

        // Mark invite as used
        db.prepare(`UPDATE witness_invites SET used = 1 WHERE id = ?`).run(invite.id);

        // Log audit
        logAudit('witness_response', responseId, 'SUBMITTED', {
            claimId: invite.claim_id,
            responseType,
            witnessName: name.trim(),
            hasEvidence: !!req.file
        }, null);

        // Send email notification to claimant
        notifyWitnessResponse(invite.claim_id, name.trim(), responseType)
            .catch(err => console.error('Failed to send notification:', err));

        res.status(201).json({
            success: true,
            message: 'Your response has been recorded. Thank you for being a witness.',
            response: {
                id: responseId,
                responseType,
                evidence: evidenceInfo
            }
        });
    } catch (error) {
        console.error('Submit witness response error:', error);
        res.status(500).json({ error: 'Failed to submit response' });
    }
});

// NO PUT/PATCH/DELETE endpoints - Witness responses are IMMUTABLE

export default router;
