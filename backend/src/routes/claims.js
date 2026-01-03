import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import {
    isValidUUID,
    sanitizeText,
    isValidCategory,
    isValidDate,
    isValidNumber,
    sanitizeFilename
} from '../middleware/security.js';
import { logAudit } from '../services/audit.js';
import { calculateConfidenceScore } from '../services/confidence.js';

// Allowed file extensions (whitelist)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // Validate extension at filesystem level too
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return cb(new Error('Invalid file extension'));
        }
        // Generate random UUID filename to prevent path traversal
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only 1 file per request
    },
    fileFilter: (req, file, cb) => {
        // Validate MIME type
        if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
        }
        // Double-check extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return cb(new Error('Invalid file extension'));
        }
        cb(null, true);
    }
});

/**
 * POST /api/claims
 * Create a new claim (IMMUTABLE once created)
 */
router.post('/', requireAuth, (req, res) => {
    try {
        const { title, description, category, startDate, endDate, location } = req.body;

        // Validation
        if (!title || title.trim().length < 5) {
            return res.status(400).json({ error: 'Title must be at least 5 characters' });
        }
        if (!description || description.trim().length < 20) {
            return res.status(400).json({ error: 'Description must be at least 20 characters' });
        }
        if (!category || !['Residence', 'Employment', 'Dependency', 'Education', 'Other'].includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }
        if (!startDate) {
            return res.status(400).json({ error: 'Start date is required' });
        }

        const claimId = uuidv4();

        // Sanitize inputs
        const sanitizedTitle = sanitizeText(title);
        const sanitizedDescription = sanitizeText(description);
        const sanitizedAddress = location?.address ? sanitizeText(location.address) : null;

        const stmt = db.prepare(`
            INSERT INTO claims (id, user_id, title, description, category, start_date, end_date, 
                               location_lat, location_lng, location_address, location_captured_at,
                               created_at, locked)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 1)
        `);

        stmt.run(
            claimId,
            req.session.userId,
            sanitizedTitle,
            sanitizedDescription,
            category,
            startDate,
            endDate || null,
            location?.lat || null,
            location?.lng || null,
            sanitizedAddress,
            location?.capturedAt || null
        );

        // Log audit
        logAudit('claim', claimId, 'CREATED', {
            title: sanitizedTitle,
            category,
            hasLocation: !!location?.lat
        }, req.session.userId);

        // Get created claim
        const claim = db.prepare('SELECT * FROM claims WHERE id = ?').get(claimId);

        res.status(201).json({ claim });
    } catch (error) {
        console.error('Create claim error:', error);
        res.status(500).json({ error: 'Failed to create claim' });
    }
});

/**
 * GET /api/claims
 * List user's claims
 */
router.get('/', requireAuth, (req, res) => {
    try {
        const claims = db.prepare(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM evidence WHERE claim_id = c.id) as evidence_count,
                   (SELECT COUNT(*) FROM witness_responses WHERE claim_id = c.id) as witness_count
            FROM claims c
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `).all(req.session.userId);

        // Add confidence scores
        const claimsWithScores = claims.map(claim => ({
            ...claim,
            confidence: calculateConfidenceScore(claim.id)
        }));

        res.json({ claims: claimsWithScores });
    } catch (error) {
        console.error('List claims error:', error);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

/**
 * GET /api/claims/:id
 * Get single claim with all details
 */
router.get('/:id', requireAuth, (req, res) => {
    try {
        // Validate UUID format to prevent injection
        if (!isValidUUID(req.params.id)) {
            return res.status(400).json({ error: 'Invalid claim ID format' });
        }

        const claim = db.prepare(`
            SELECT * FROM claims WHERE id = ? AND user_id = ?
        `).get(req.params.id, req.session.userId);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Get evidence
        const evidence = db.prepare(`
            SELECT id, file_type, original_name, uploaded_at FROM evidence WHERE claim_id = ?
        `).all(claim.id);

        // Get witness invites
        const invites = db.prepare(`
            SELECT id, token, created_at, used FROM witness_invites WHERE claim_id = ?
        `).all(claim.id);

        // Get witness responses
        const responses = db.prepare(`
            SELECT id, name, relationship, response_type, comment, created_at 
            FROM witness_responses WHERE claim_id = ?
            ORDER BY created_at ASC
        `).all(claim.id);

        // Get confidence score
        const confidence = calculateConfidenceScore(claim.id);

        res.json({
            claim,
            evidence,
            invites,
            responses,
            confidence
        });
    } catch (error) {
        console.error('Get claim error:', error);
        res.status(500).json({ error: 'Failed to fetch claim' });
    }
});

/**
 * POST /api/claims/:id/evidence
 * Upload evidence for a claim
 */
router.post('/:id/evidence', requireAuth, upload.single('file'), (req, res) => {
    try {
        const claim = db.prepare(`
            SELECT * FROM claims WHERE id = ? AND user_id = ?
        `).get(req.params.id, req.session.userId);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const evidenceId = uuidv4();

        const stmt = db.prepare(`
            INSERT INTO evidence (id, claim_id, file_type, file_path, original_name, uploaded_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `);

        stmt.run(
            evidenceId,
            claim.id,
            req.file.mimetype,
            req.file.filename,
            req.file.originalname
        );

        // Log audit
        logAudit('evidence', evidenceId, 'UPLOADED', {
            claimId: claim.id,
            fileName: req.file.originalname
        }, req.session.userId);

        res.status(201).json({
            evidence: {
                id: evidenceId,
                file_type: req.file.mimetype,
                original_name: req.file.originalname
            }
        });
    } catch (error) {
        console.error('Upload evidence error:', error);
        res.status(500).json({ error: 'Failed to upload evidence' });
    }
});

/**
 * GET /api/claims/:id/evidence/:evidenceId
 * Get evidence file
 */
router.get('/:id/evidence/:evidenceId', (req, res) => {
    try {
        const evidence = db.prepare(`
            SELECT e.* FROM evidence e
            JOIN claims c ON e.claim_id = c.id
            WHERE e.id = ? AND e.claim_id = ?
        `).get(req.params.evidenceId, req.params.id);

        if (!evidence) {
            return res.status(404).json({ error: 'Evidence not found' });
        }

        const filePath = path.join(uploadDir, evidence.file_path);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Get evidence error:', error);
        res.status(500).json({ error: 'Failed to fetch evidence' });
    }
});

/**
 * POST /api/claims/:id/invite
 * Generate a witness invitation link
 */
router.post('/:id/invite', requireAuth, (req, res) => {
    try {
        const claim = db.prepare(`
            SELECT * FROM claims WHERE id = ? AND user_id = ?
        `).get(req.params.id, req.session.userId);

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const inviteId = uuidv4();
        const token = uuidv4(); // Unguessable token

        const stmt = db.prepare(`
            INSERT INTO witness_invites (id, claim_id, token, created_at, used)
            VALUES (?, ?, ?, datetime('now'), 0)
        `);

        stmt.run(inviteId, claim.id, token);

        // Log audit
        logAudit('witness_invite', inviteId, 'CREATED', { claimId: claim.id }, req.session.userId);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const witnessUrl = `${frontendUrl}/witness/${token}`;

        res.status(201).json({
            invite: {
                id: inviteId,
                token,
                url: witnessUrl
            }
        });
    } catch (error) {
        console.error('Create invite error:', error);
        res.status(500).json({ error: 'Failed to create invitation' });
    }
});

// NO PUT/PATCH/DELETE endpoints - Claims are IMMUTABLE

export default router;
