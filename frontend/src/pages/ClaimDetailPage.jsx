import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { claims } from '../services/api';
import ConfidenceScore from '../components/ConfidenceScore';
import EvidenceUpload from '../components/EvidenceUpload';
import WitnessInviteModal from '../components/WitnessInviteModal';

export default function ClaimDetailPage() {
    const { id } = useParams();
    const [claim, setClaim] = useState(null);
    const [evidence, setEvidence] = useState([]);
    const [invites, setInvites] = useState([]);
    const [responses, setResponses] = useState([]);
    const [confidence, setConfidence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClaim();
    }, [id]);

    const fetchClaim = async () => {
        try {
            setLoading(true);
            const response = await claims.get(id);
            setClaim(response.data.claim);
            setEvidence(response.data.evidence);
            setInvites(response.data.invites);
            setResponses(response.data.responses);
            setConfidence(response.data.confidence);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load claim');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadEvidence = async (file) => {
        try {
            setUploading(true);
            await claims.uploadEvidence(id, file);
            fetchClaim(); // Refresh to get new evidence and score
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to upload evidence');
        } finally {
            setUploading(false);
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
            <div className="document-container">
                <div className="flex items-center justify-center py-20">
                    <div className="spinner text-accent-500" />
                </div>
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="document-container">
                <div className="document-card text-center py-12">
                    <p className="text-danger-600">{error || 'Claim not found'}</p>
                    <Link to="/" className="btn-primary mt-4">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="document-container">
            {/* Header */}
            <div className="mb-8">
                <Link to="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-4 inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Claims
                </Link>
                <div className="flex items-start justify-between gap-4 mt-2">
                    <div>
                        <span className={getCategoryBadgeClass(claim.category)}>
                            {claim.category}
                        </span>
                        <h1 className="text-2xl font-bold mt-2">{claim.title}</h1>
                        <p className="text-[var(--color-text-secondary)] mt-1">
                            {formatDate(claim.start_date)} — {formatDate(claim.end_date)}
                        </p>
                    </div>
                    <Link
                        to={`/proof/${claim.id}`}
                        target="_blank"
                        className="btn-secondary text-sm flex-shrink-0"
                    >
                        View Public Proof
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="document-card">
                        <h2 className="font-semibold mb-3">Description</h2>
                        <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap">
                            {claim.description}
                        </p>
                    </div>

                    {/* Evidence */}
                    <div className="document-card">
                        <h2 className="font-semibold mb-4">Evidence</h2>

                        {evidence.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                {evidence.map(e => (
                                    <a
                                        key={e.id}
                                        href={`/api/claims/${claim.id}/evidence/${e.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {e.file_type.startsWith('image/') ? (
                                                <svg className="w-8 h-8 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium mt-2 truncate">
                                            {e.original_name}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {formatDate(e.uploaded_at)}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        )}

                        <EvidenceUpload onUpload={handleUploadEvidence} uploading={uploading} />
                    </div>

                    {/* Witness Responses */}
                    <div className="document-card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold">Witness Responses</h2>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="btn-primary text-sm py-2 px-4"
                            >
                                Invite Witness
                            </button>
                        </div>

                        {responses.length === 0 ? (
                            <p className="text-[var(--color-text-secondary)] text-center py-8">
                                No witness responses yet. Invite witnesses to verify your claim.
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
                                                            response.response_type === 'PARTIAL' ? 'Partially Confirmed' : 'Denied'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                                    {response.relationship}
                                                </p>
                                                {response.comment && (
                                                    <p className="mt-2 text-sm">{response.comment}</p>
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
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Confidence Score */}
                    <div className="document-card">
                        <ConfidenceScore confidence={confidence} showBreakdown={true} />
                    </div>

                    {/* Pending Invites */}
                    {invites.filter(i => !i.used).length > 0 && (
                        <div className="document-card">
                            <h3 className="font-semibold mb-3">Pending Invites</h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                {invites.filter(i => !i.used).length} invite(s) awaiting response
                            </p>
                        </div>
                    )}

                    {/* Immutability Notice */}
                    <div className="document-card bg-primary-50 dark:bg-primary-900/30">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-medium text-sm">Immutable Record</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                    This claim and all witness responses are permanently recorded and cannot be modified.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Witness Invite Modal */}
            {showInviteModal && (
                <WitnessInviteModal
                    claimId={claim.id}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
        </div>
    );
}
