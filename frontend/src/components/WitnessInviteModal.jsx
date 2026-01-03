import { useState } from 'react';
import { claims } from '../services/api';

export default function WitnessInviteModal({ claimId, onClose }) {
    const [loading, setLoading] = useState(false);
    const [inviteUrl, setInviteUrl] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    const generateLink = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await claims.createInvite(claimId);
            setInviteUrl(response.data.invite.url);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate link');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = inviteUrl;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="document-card-lg max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Invite Witness</h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!inviteUrl ? (
                    <>
                        <p className="text-[var(--color-text-secondary)] mb-6">
                            Generate a unique, one-time link to share with a witness.
                            They can view your claim and submit their response without creating an account.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={generateLink}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="spinner" />
                                    Generating...
                                </span>
                            ) : (
                                'Generate Witness Link'
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-[var(--color-text-secondary)] mb-4">
                            Share this link with your witness. They can use it once to submit their response.
                        </p>

                        <div className="bg-primary-50 dark:bg-primary-900/50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-mono break-all">{inviteUrl}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={copyToClipboard}
                                className="btn-primary flex-1"
                            >
                                {copied ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Copied!
                                    </span>
                                ) : (
                                    'Copy Link'
                                )}
                            </button>
                            <button
                                onClick={generateLink}
                                disabled={loading}
                                className="btn-secondary"
                            >
                                Generate New
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
                            Note: Each link can only be used once. Generate a new link for each witness.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
