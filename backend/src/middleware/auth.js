/**
 * Authentication middleware
 * Protects routes that require a logged-in user
 */
export function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
    }
    next();
}

/**
 * Optional auth - populates req.user if logged in but doesn't require it
 */
export function optionalAuth(req, res, next) {
    // Just pass through - session data is already available
    next();
}

export default { requireAuth, optionalAuth };
