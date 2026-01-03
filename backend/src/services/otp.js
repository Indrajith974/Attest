import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import db from '../db/database.js';

// Generate a 6-digit OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create and store OTP for email
export function createOTP(email) {
    const otp = generateOTP();
    const id = uuidv4();

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const stmt = db.prepare(`
        INSERT INTO otp_tokens (id, email, otp, expires_at)
        VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, email.toLowerCase(), otp, expiresAt);

    return { id, otp, expiresAt };
}

// Verify OTP for email
export function verifyOTP(email, otp) {
    const stmt = db.prepare(`
        SELECT * FROM otp_tokens 
        WHERE email = ? AND otp = ? AND used = 0 AND expires_at > datetime('now')
        ORDER BY created_at DESC 
        LIMIT 1
    `);

    const token = stmt.get(email.toLowerCase(), otp);

    if (!token) {
        return { valid: false, reason: 'Invalid or expired OTP' };
    }

    // Mark OTP as used
    const updateStmt = db.prepare(`UPDATE otp_tokens SET used = 1 WHERE id = ?`);
    updateStmt.run(token.id);

    return { valid: true, email: token.email };
}

// Send OTP via email (supports Resend, SMTP, or console)
export async function sendOTP(email, otp) {
    // Option 1: Resend API (recommended for production)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
        return await sendViaResend(email, otp, resendApiKey);
    }

    // Option 2: SMTP (Gmail, etc.)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
        return await sendViaSMTP(email, otp, { smtpHost, smtpUser, smtpPass });
    }

    // Option 3: Console (dev mode)
    console.log('\n========================================');
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log('========================================\n');
    return { success: true, method: 'console' };
}

// Send via Resend API
async function sendViaResend(email, otp, apiKey) {
    try {
        const fromEmail = process.env.RESEND_FROM || 'Attest <noreply@resend.dev>';

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: 'Your Attest Login Code',
                html: getEmailHTML(otp),
                text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Resend API error');
        }

        return { success: true, method: 'resend' };
    } catch (error) {
        console.error('Failed to send OTP via Resend:', error);
        return { success: false, error: error.message };
    }
}

// Send via SMTP
async function sendViaSMTP(email, otp, { smtpHost, smtpUser, smtpPass }) {
    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        await transporter.sendMail({
            from: `"Attest" <${smtpUser}>`,
            to: email,
            subject: 'Your Attest Login Code',
            text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
            html: getEmailHTML(otp)
        });

        return { success: true, method: 'smtp' };
    } catch (error) {
        console.error('Failed to send OTP via SMTP:', error);
        return { success: false, error: error.message };
    }
}

// Email HTML template
function getEmailHTML(otp) {
    return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #06b6d4); border-radius: 12px; line-height: 48px;">
                    <span style="color: white; font-size: 24px;">✓</span>
                </div>
            </div>
            <h1 style="color: #1a1a2e; font-size: 24px; text-align: center; margin-bottom: 8px;">Attest</h1>
            <p style="color: #666; text-align: center; margin-bottom: 32px;">Your verification code is:</p>
            <div style="background: linear-gradient(135deg, #f0f0f0, #e8e8e8); padding: 24px; text-align: center; font-size: 36px; letter-spacing: 8px; font-weight: bold; margin: 0 auto 32px; border-radius: 12px; font-family: monospace;">
                ${otp}
            </div>
            <p style="color: #888; text-align: center; font-size: 14px; margin-bottom: 8px;">This code expires in 10 minutes.</p>
            <p style="color: #aaa; text-align: center; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
    `;
}

// Get or create user by email
export function getOrCreateUser(email) {
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    let user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(normalizedEmail);

    if (!user) {
        // Create new user
        const id = uuidv4();
        const stmt = db.prepare(`
            INSERT INTO users (id, email, created_at)
            VALUES (?, ?, datetime('now'))
        `);
        stmt.run(id, normalizedEmail);

        user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
    }

    return user;
}

export default { generateOTP, createOTP, verifyOTP, sendOTP, getOrCreateUser };
