import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import db, { initializeDatabase } from './db/database.js';
import { runMigrations } from './db/migrate.js';
import authRoutes from './routes/auth.js';
import claimsRoutes from './routes/claims.js';
import witnessesRoutes from './routes/witnesses.js';
import publicRoutes from './routes/public.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize database and run migrations
initializeDatabase();
runMigrations();

// Create uploads directory
const uploadDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

// ═══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Helmet - Security headers (OWASP A05:2021 - Security Misconfiguration)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://nominatim.openstreetmap.org"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for QR codes
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Prevent HTTP parameter pollution (OWASP A03:2021 - Injection)
app.use(hpp());

// Trust proxy in production (for Render, Railway, etc.)
if (isProduction) {
    app.set('trust proxy', 1);
}

// CORS - Strict origin policy (OWASP A05:2021)
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5173'
        ];
        // Allow requests with no origin (mobile apps, curl, etc) in dev
        if (!origin && !isProduction) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Body parsing with size limits (OWASP A04:2021 - Insecure Design)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ═══════════════════════════════════════════════════════════════
// SESSION CONFIGURATION (OWASP A07:2021 - Authentication Failures)
// ═══════════════════════════════════════════════════════════════

// Validate SESSION_SECRET
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error('❌ CRITICAL: SESSION_SECRET must be at least 32 characters!');
    if (isProduction) {
        process.exit(1);
    }
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret-not-for-production',
    resave: false,
    saveUninitialized: false,
    name: 'attest.sid', // Custom session cookie name (hide technology)
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
    },
    rolling: true // Refresh session on activity
}));

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING (OWASP A04:2021 - Insecure Design)
// ═══════════════════════════════════════════════════════════════

const createRateLimiter = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Use default keyGenerator which properly handles IPv6
    validate: { xForwardedForHeader: false },
    skip: (req) => {
        // Skip health checks
        return req.path === '/api/health';
    }
});

// Strict limiter for OTP (prevent enumeration)
const otpLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 requests
    'Too many OTP requests. Please try again in 15 minutes.'
);

// Auth limiter (prevent brute force)
const authLimiter = createRateLimiter(
    15 * 60 * 1000,
    15,
    'Too many authentication attempts. Please try again later.'
);

// API limiter (general protection)
const apiLimiter = createRateLimiter(
    15 * 60 * 1000,
    100,
    'Too many requests. Please slow down.'
);

// Strict limiter for file uploads
const uploadLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    20, // 20 uploads per hour
    'Too many file uploads. Please try again later.'
);

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check (no rate limit)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply rate limiters
app.use('/api/auth/request-otp', otpLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/claims', apiLimiter);
app.use('/api/witness', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/witness', witnessesRoutes);
app.use('/api/proof', publicRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve uploaded files with security headers
app.use('/uploads', (req, res, next) => {
    // Prevent path traversal (OWASP A01:2021)
    const requestedPath = path.normalize(req.path);
    if (requestedPath.includes('..')) {
        return res.status(403).json({ error: 'Access denied' });
    }

    // Set security headers for served files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    next();
}, express.static(uploadDir, {
    dotfiles: 'deny',
    index: false
}));

// Serve frontend in production
if (isProduction) {
    const publicDir = path.join(process.cwd(), 'public');
    app.use(express.static(publicDir));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
            return next();
        }
        res.sendFile(path.join(publicDir, 'index.html'));
    });
}

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING (OWASP A09:2021 - Security Logging)
// ═══════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
    // Log error without exposing stack trace
    console.error('Error:', {
        message: err.message,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // CORS error
    if (err.message === 'CORS not allowed') {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: 'File upload error' });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    // Generic error (don't expose internal details)
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🛡️  Attest Backend - Security Hardened                  ║
║                                                           ║
║   Server running on http://localhost:${PORT}                ║
║   Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}                          ║
║                                                           ║
║   Security Features:                                      ║
║   ✓ Helmet (Security Headers)                             ║
║   ✓ Rate Limiting (OTP/Auth/API)                          ║
║   ✓ CORS (Origin Validation)                              ║
║   ✓ Session (Secure Cookies)                              ║
║   ✓ Input Sanitization                                    ║
║   ✓ Path Traversal Protection                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

export default app;
