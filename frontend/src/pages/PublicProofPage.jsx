import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../services/api';
import ConfidenceScore from '../components/ConfidenceScore';
import Timeline from '../components/Timeline';
import Disclaimer from '../components/Disclaimer';

export default function PublicProofPage() {
    const { claimId } = useParams();
    const [proof, setProof] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCode, setQrCode] = useState(null);

    useEffect(() => {
        fetchProof();
        fetchQrCode();
    }, [claimId]);

    const fetchProof = async () => {
        try {
            setLoading(true);
            const response = await publicApi.getProof(claimId);
            setProof(response.data.proof);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load proof');
        } finally {
            setLoading(false);
        }
    };

    const fetchQrCode = async () => {
        try {
            const response = await publicApi.getQrCode(claimId);
            setQrCode(response.data.qrCode);
        } catch (err) {
            console.log('Could not load QR code');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Present';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryBadgeClass = (category) => {
        const classes = {
            'Residence': 'badge-residence',
            'Employment': 'badge-employment',
            'Dependency': 'badge-dependency',
            'Education': 'badge-education',
            'Other': 'badge-other'
        };
        return classes[category] || 'badge-other';
    };

    const getResponseBadgeClass = (type) => {
        const classes = {
            'CONFIRM': 'badge-confirm',
            'PARTIAL': 'badge-partial',
            'DENY': 'badge-deny'
        };
        return classes[type] || 'badge-other';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner text-accent-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="document-container py-12">
                <div className="document-card-lg text-center">
                    <svg className="w-16 h-16 mx-auto text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 className="text-2xl font-bold mt-4">Proof Not Found</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">{error}</p>
                </div>
            </div>
        );
    }

    const { claim, evidence, responses, responseCounts, confidence, timeline } = proof;

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-4">
                <div className="document-container flex items-center gap-3">
                    <svg className="w-8 h-8 text-accent-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                    <div>
                        <span className="text-lg font-semibold">Attest</span>
                        <span className="text-sm text-[var(--color-text-secondary)] ml-2">Public Proof</span>
                    </div>
                </div>
            </header>

            <main className="document-container py-8">
                <Disclaimer className="mb-8" />

                {/* Claim Header */}
                <div className="document-card-lg mb-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <span className={getCategoryBadgeClass(claim.category)}>
                                {claim.category}
                            </span>
                            <h1 className="text-2xl font-bold mt-2">{claim.title}</h1>
                            <p className="text-[var(--color-text-secondary)] mt-1">
                                Claimed by <strong>{claim.claimantName}</strong>
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {formatDate(claim.startDate)} — {formatDate(claim.endDate)}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-border)] pt-6">
                        <h2 className="font-semibold mb-3">Description</h2>
                        <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap">
                            {claim.description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Evidence */}
                        {evidence.length > 0 && (
                            <div className="document-card">
                                <h2 className="font-semibold mb-4">Supporting Evidence</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {evidence.map(e => (
                                        <a
                                            key={e.id}
                                            href={`/api/proof/${claimId}/evidence/${e.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors"
                                        >
                                            {e.type.startsWith('image/') ? (
                                                <svg className="w-8 h-8 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <p className="text-sm font-medium mt-2 truncate">{e.name}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                {formatDate(e.uploadedAt)}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Witness Responses */}
                        <div className="document-card">
                            <h2 className="font-semibold mb-4">Witness Responses</h2>

                            {/* Summary */}
                            <div className="flex gap-4 mb-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-success-500"></span>
                                    <span>{responseCounts.confirm} Confirmed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-warning-500"></span>
                                    <span>{responseCounts.partial} Partial</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-danger-500"></span>
                                    <span>{responseCounts.deny} Denied</span>
                                </div>
                            </div>

                            {responses.length === 0 ? (
                                <p className="text-[var(--color-text-secondary)] text-center py-8">
                                    No witness responses yet.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {responses.map(response => (
                                        <div key={response.id} className="p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{response.name}</span>
                                                        <span className={getResponseBadgeClass(response.response_type)}>
                                                            {response.response_type === 'CONFIRM' ? 'Confirmed' :
                                                                response.response_type === 'PARTIAL' ? 'Partial' : 'Denied'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                                        {response.relationship}
                                                    </p>
                                                    {response.comment && (
                                                        <p className="mt-2 text-sm italic">"{response.comment}"</p>
                                                    )}
                                                </div>
                                                <span className="text-xs text-[var(--color-text-secondary)]">
                                                    {formatDate(response.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="document-card">
                            <h2 className="font-semibold mb-4">Verification Timeline</h2>
                            <Timeline events={timeline} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Confidence Score */}
                        <div className="document-card">
                            <ConfidenceScore confidence={confidence} showBreakdown={true} />
                        </div>

                        {/* Verification Status */}
                        <div className="document-card">
                            <h3 className="font-semibold mb-3">Verification Status</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Total Witnesses</span>
                                    <span className="font-medium">{responseCounts.total}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Evidence Files</span>
                                    <span className="font-medium">{evidence.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Created</span>
                                    <span className="font-medium">{formatDate(claim.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Download & Share */}
                        <div className="document-card">
                            <h3 className="font-semibold mb-3">Download & Share</h3>
                            <div className="space-y-3">
                                <a
                                    href={`/api/proof/${claimId}/pdf`}
                                    download
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </a>
                                {qrCode && (
                                    <div className="text-center">
                                        <img src={qrCode} alt="QR Code" className="mx-auto w-32 h-32" />
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-2">Scan to view on mobile</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Proof ID */}
                        <div className="document-card bg-primary-50 dark:bg-primary-900/30">
                            <h3 className="font-semibold mb-2 text-sm">Proof ID</h3>
                            <p className="text-xs font-mono break-all text-[var(--color-text-secondary)]">
                                {claimId}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--color-border)] py-6 mt-12">
                <div className="document-container text-center text-sm text-[var(--color-text-secondary)]">
                    <p>This is a read-only public proof page generated by Attest.</p>
                    <p className="mt-1">All records are immutable and cannot be modified after creation.</p>
                </div>
            </footer>
        </div>
    );
}
