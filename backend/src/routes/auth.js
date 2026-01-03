import express from 'express';
import db from '../db/database.js';
import { createOTP, verifyOTP, sendOTP, getOrCreateUser } from '../services/otp.js';
import { logAudit } from '../services/audit.js';
import { sanitizeEmail, sanitizeText } from '../middleware/security.js';

const router = express.Router();

/**
 * POST /api/auth/request-otp
 * Request an OTP for email login
 */
router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate and sanitize email
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Create OTP
        const { otp } = createOTP(sanitizedEmail);

        // Send OTP (via email or console in dev mode)
        const result = await sendOTP(sanitizedEmail, otp);

        if (!result.success) {
            return res.status(500).json({ error: 'Failed to send verification code' });
        }

        // Log attempt (without exposing email fully)
        logAudit('auth', 'otp-request', 'OTP_REQUESTED', {
            emailHash: sanitizedEmail.slice(0, 3) + '***'
        }, null);

        res.json({
            success: true,
            message: 'Verification code sent to your email',
            // In dev mode, hint that OTP is in console
            ...(result.method === 'console' && { dev: true })
        });
    } catch (error) {
        console.error('Request OTP error:', error.message);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and create session
 */
router.post('/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate inputs
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // OTP must be exactly 6 digits
        if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({ error: 'Invalid OTP format' });
        }

        // Verify OTP
        const result = verifyOTP(sanitizedEmail, otp);

        if (!result.valid) {
            // Log failed attempt
            logAudit('auth', 'otp-verify', 'OTP_FAILED', {
                reason: result.reason,
                emailHash: sanitizedEmail.slice(0, 3) + '***'
            }, null);
            return res.status(401).json({ error: result.reason });
        }

        // Get or create user
        const user = getOrCreateUser(sanitizedEmail);

        // Regenerate session to prevent session fixation
        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regeneration failed:', err);
                return res.status(500).json({ error: 'Authentication failed' });
            }

            // Set session data
            req.session.userId = user.id;
            req.session.email = user.email;

            // Log successful login
            logAudit('user', user.id, 'LOGIN', { method: 'otp' }, user.id);

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        });
    } catch (error) {
        console.error('Verify OTP error:', error.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
        .get(req.session.userId);

    if (!user) {
        req.session.destroy();
        return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
});

/**
 * POST /api/auth/update-name
 * Update user's display name
 */
router.post('/update-name', (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name } = req.body;

    // Sanitize and validate name
    const sanitizedName = sanitizeText(name, 100);
    if (!sanitizedName || sanitizedName.length < 2) {
        return res.status(400).json({ error: 'Name must be 2-100 characters' });
    }

    db.prepare('UPDATE users SET name = ? WHERE id = ?')
        .run(sanitizedName, req.session.userId);

    logAudit('user', req.session.userId, 'NAME_UPDATED', { name: sanitizedName }, req.session.userId);

    res.json({ success: true, name: sanitizedName });
});

/**
 * POST /api/auth/logout
 * Destroy session
 */
router.post('/logout', (req, res) => {
    if (req.session && req.session.userId) {
        logAudit('user', req.session.userId, 'LOGOUT', null, req.session.userId);
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err.message);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('attest.sid');
        res.json({ success: true });
    });
});

export default router;
