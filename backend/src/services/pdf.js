import PDFDocument from 'pdfkit';
import db from '../db/database.js';
import { calculateConfidenceScore } from '../services/confidence.js';

/**
 * Generate PDF proof document for a claim
 */
export function generateProofPDF(claimId) {
    return new Promise((resolve, reject) => {
        try {
            // Get claim data
            const claim = db.prepare(`
                SELECT c.*, u.name as claimant_name, u.email as claimant_email
                FROM claims c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = ?
            `).get(claimId);

            if (!claim) {
                reject(new Error('Claim not found'));
                return;
            }

            // Get witness responses
            const responses = db.prepare(`
                SELECT * FROM witness_responses WHERE claim_id = ? ORDER BY created_at ASC
            `).all(claimId);

            // Get evidence
            const evidence = db.prepare(`
                SELECT * FROM evidence WHERE claim_id = ?
            `).all(claimId);

            // Calculate confidence
            const confidence = calculateConfidenceScore(claimId);

            // Create PDF
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('Attest', { align: 'center' });
            doc.fontSize(12).font('Helvetica').text('Human-Verified Proof Document', { align: 'center' });
            doc.moveDown(0.5);

            // Disclaimer
            doc.fontSize(9).fillColor('#666')
                .text('IMPORTANT: This is NOT a legal or government certificate. This is a personal truth-recording system based on human witness verification.', {
                    align: 'center',
                    width: 450
                });
            doc.moveDown(1);

            // Divider
            doc.strokeColor('#e0e0e0').lineWidth(1)
                .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            // Claim Details
            doc.fillColor('#000').fontSize(16).font('Helvetica-Bold')
                .text('Claim Details');
            doc.moveDown(0.5);

            doc.fontSize(11).font('Helvetica');
            doc.text(`Title: `, { continued: true }).font('Helvetica-Bold').text(claim.title);
            doc.font('Helvetica').text(`Category: ${claim.category}`);
            doc.text(`Claimant: ${claim.claimant_name || claim.claimant_email}`);
            doc.text(`Period: ${formatDate(claim.start_date)} — ${claim.end_date ? formatDate(claim.end_date) : 'Present'}`);
            doc.text(`Created: ${formatDate(claim.created_at)}`);
            doc.moveDown(0.5);

            doc.text('Description:', { underline: true });
            doc.text(claim.description, { width: 495 });
            doc.moveDown(1);

            // Confidence Score
            doc.fontSize(16).font('Helvetica-Bold').text('Confidence Score');
            doc.moveDown(0.5);

            const scoreColor = confidence.score >= 70 ? '#22c55e' : confidence.score >= 40 ? '#f59e0b' : '#ef4444';
            doc.fontSize(28).fillColor(scoreColor).text(`${confidence.score}/100`, { continued: true });
            doc.fontSize(11).fillColor('#666').text(`  ${confidence.score >= 70 ? 'High Confidence' : confidence.score >= 40 ? 'Moderate Confidence' : 'Low Confidence'}`);

            doc.fillColor('#000').fontSize(10);
            doc.text(`Base: 40 | Confirms: +${confidence.breakdown.confirmBonus} | Partial: +${confidence.breakdown.partialBonus} | Denials: -${confidence.breakdown.denyPenalty} | Evidence: +${confidence.breakdown.evidenceBonus}`);
            doc.moveDown(1);

            // Witness Responses
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text('Witness Responses');
            doc.moveDown(0.5);

            if (responses.length === 0) {
                doc.fontSize(11).font('Helvetica').fillColor('#666').text('No witness responses recorded.');
            } else {
                responses.forEach((response, i) => {
                    const typeColor = response.response_type === 'CONFIRM' ? '#22c55e' :
                        response.response_type === 'PARTIAL' ? '#f59e0b' : '#ef4444';

                    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000')
                        .text(`${i + 1}. ${response.name}`, { continued: true });
                    doc.font('Helvetica').fillColor(typeColor)
                        .text(` — ${response.response_type}`);

                    doc.fillColor('#666').fontSize(10)
                        .text(`   Relationship: ${response.relationship}`);

                    if (response.comment) {
                        doc.text(`   Comment: "${response.comment}"`);
                    }
                    doc.text(`   Date: ${formatDate(response.created_at)}`);
                    doc.moveDown(0.3);
                });
            }
            doc.moveDown(1);

            // Evidence
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text('Evidence');
            doc.moveDown(0.5);

            if (evidence.length === 0) {
                doc.fontSize(11).font('Helvetica').fillColor('#666').text('No evidence uploaded.');
            } else {
                doc.fontSize(11).font('Helvetica').fillColor('#000');
                evidence.forEach((e, i) => {
                    doc.text(`${i + 1}. ${e.original_name} (${e.file_type}) — Uploaded ${formatDate(e.uploaded_at)}`);
                });
            }
            doc.moveDown(1);

            // Footer
            doc.strokeColor('#e0e0e0').lineWidth(1)
                .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);

            doc.fontSize(9).fillColor('#666').text(`Proof ID: ${claimId}`, { align: 'center' });
            doc.text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
            doc.text('This document is an export from Attest and represents data as of the generation date.', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default { generateProofPDF };
