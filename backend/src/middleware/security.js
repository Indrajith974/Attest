/**
 * Security Middleware
 * Input validation, sanitization, and security utilities
 */
import validator from 'validator';
import sanitizeHtml from 'sanitize-html';

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate UUID format
 */
export function isValidUUID(id) {
    return typeof id === 'string' && UUID_REGEX.test(id);
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email) {
    if (!email || typeof email !== 'string') return null;
    const normalized = validator.normalizeEmail(email.toLowerCase().trim());
    if (!normalized || !validator.isEmail(normalized)) return null;
    return normalized;
}

/**
 * Sanitize text input (remove HTML, trim, limit length)
 */
export function sanitizeText(text, maxLength = 10000) {
    if (!text || typeof text !== 'string') return '';

    const sanitized = sanitizeHtml(text, {
        allowedTags: [],
        allowedAttributes: {}
    }).trim();

    return sanitized.slice(0, maxLength);
}

/**
 * Validate claim category
 */
export function isValidCategory(category) {
    const validCategories = ['Residence', 'Employment', 'Dependency', 'Education', 'Other'];
    return validCategories.includes(category);
}

/**
 * Validate response type
 */
export function isValidResponseType(type) {
    return ['CONFIRM', 'PARTIAL', 'DENY'].includes(type);
}

/**
 * Validate date string (ISO format)
 */
export function isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') return 'file';
    // Remove path components and special characters
    return filename
        .replace(/[\/\\:*?"<>|]/g, '')
        .replace(/\.\./g, '')
        .slice(0, 255);
}

/**
 * Validate numeric input
 */
export function isValidNumber(value, min = -Infinity, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

/**
 * Rate limit key generator that's more robust
 */
export function getClientIP(req) {
    return req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection?.remoteAddress ||
        'unknown';
}

/**
 * Middleware: Validate UUID parameter
 */
export function validateUUIDParam(paramName) {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!isValidUUID(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        next();
    };
}

/**
 * Middleware: Validate request body has required fields
 */
export function requireFields(...fields) {
    return (req, res, next) => {
        const missing = fields.filter(f => !req.body[f]);
        if (missing.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missing.join(', ')}`
            });
        }
        next();
    };
}

export default {
    isValidUUID,
    sanitizeEmail,
    sanitizeText,
    isValidCategory,
    isValidResponseType,
    isValidDate,
    sanitizeFilename,
    isValidNumber,
    getClientIP,
    validateUUIDParam,
    requireFields
};
