import nodemailer from 'nodemailer';
import db from '../db/database.js';

/**
 * Send notification email when a witness responds
 */
export async function notifyWitnessResponse(claimId, witnessName, responseType) {
    // Get claim and claimant info
    const claim = db.prepare(`
        SELECT c.title, u.email as claimant_email, u.name as claimant_name
        FROM claims c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    `).get(claimId);

    if (!claim) {
        console.error('Claim not found for notification:', claimId);
        return;
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // If SMTP not configured, log to console
    if (!smtpHost || !smtpUser || !smtpPass) {
        console.log('\n========================================');
        console.log(`📧 Notification for ${claim.claimant_email}:`);
        console.log(`   ${witnessName} responded "${responseType}" to "${claim.title}"`);
        console.log('========================================\n');
        return { success: true, method: 'console' };
    }

    const responseLabel = responseType === 'CONFIRM' ? 'confirmed' :
        responseType === 'PARTIAL' ? 'partially confirmed' : 'denied';

    const responseColor = responseType === 'CONFIRM' ? '#22c55e' :
        responseType === 'PARTIAL' ? '#f59e0b' : '#ef4444';

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
            to: claim.claimant_email,
            subject: `Witness Response: ${witnessName} ${responseLabel} your claim`,
            text: `Hello ${claim.claimant_name || 'there'},\n\n${witnessName} has ${responseLabel} your claim "${claim.title}".\n\nLog in to Attest to view the full response.\n\nBest,\nAttest`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a1a2e;">Attest</h2>
                    <p>Hello ${claim.claimant_name || 'there'},</p>
                    <p><strong>${witnessName}</strong> has responded to your claim:</p>
                    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 0 0 8px 0; font-weight: bold;">${claim.title}</p>
                        <p style="margin: 0; color: ${responseColor}; font-weight: bold;">
                            ${responseType === 'CONFIRM' ? '✓ Confirmed' :
                    responseType === 'PARTIAL' ? '⚠ Partially Confirmed' : '✗ Denied'}
                        </p>
                    </div>
                    <p>Log in to <a href="${process.env.FRONTEND_URL}">Attest</a> to view the full response and updated confidence score.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 24px;">
                        This is an automated notification from Attest.
                    </p>
                </div>
            `
        });

        return { success: true, method: 'email' };
    } catch (error) {
        console.error('Failed to send notification email:', error);
        return { success: false, error: error.message };
    }
}

export default { notifyWitnessResponse };
