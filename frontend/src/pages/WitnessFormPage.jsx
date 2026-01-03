import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { witness } from '../services/api';
import Disclaimer from '../components/Disclaimer';

export default function WitnessFormPage() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        relationship: '',
        responseType: '',
        comment: ''
    });

    const [evidenceFile, setEvidenceFile] = useState(null);

    useEffect(() => {
        fetchClaim();
    }, [token]);

    const fetchClaim = async () => {
        try {
            setLoading(true);
            const response = await witness.getClaim(token);
            setClaim(response.data.claim);
        } catch (err) {
            if (err.response?.status === 410) {
                setError('This invitation link has already been used.');
            } else {
                setError(err.response?.data?.error || 'Invalid invitation link');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.name.length < 2) {
            setError('Please enter your name');
            return;
        }
        if (formData.relationship.length < 2) {
            setError('Please describe your relationship to the claimant');
            return;
        }
        if (!formData.responseType) {
            setError('Please select a response');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await witness.submitResponse(token, formData, evidenceFile);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit response');
        } finally {
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner text-accent-500" />
            </div>
        );
    }

    if (error && !claim) {
        return (
            <div className="document-container py-12">
                <div className="document-card-lg text-center">
                    <svg className="w-16 h-16 mx-auto text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h1 className="text-2xl font-bold mt-4">{error}</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">
                        Please contact the person who sent you this link for a new invitation.
                    </p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="document-container py-12">
                <div className="document-card-lg text-center">
                    <svg className="w-16 h-16 mx-auto text-success-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-2xl font-bold mt-4">Thank You!</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">
                        Your witness response has been recorded and cannot be modified.
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                        You can close this window.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="document-container py-8">
            <div className="text-center mb-8">
                <svg className="w-12 h-12 mx-auto text-accent-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
                <h1 className="text-2xl font-bold mt-4">Witness Verification Request</h1>
                <p className="text-[var(--color-text-secondary)] mt-2">
                    You have been invited to verify a claim by <strong>{claim.claimantName}</strong>
                </p>
            </div>

            <Disclaimer className="mb-8" />

            {/* Claim Summary */}
            <div className="document-card mb-8">
                <h2 className="font-semibold mb-4">Claim Details</h2>
                <div className="space-y-3">
                    <div>
                        <span className="text-sm text-[var(--color-text-secondary)]">Title</span>
                        <p className="font-medium">{claim.title}</p>
                    </div>
                    <div>
                        <span className="text-sm text-[var(--color-text-secondary)]">Category</span>
                        <p>{claim.category}</p>
                    </div>
                    <div>
                        <span className="text-sm text-[var(--color-text-secondary)]">Period</span>
                        <p>{formatDate(claim.startDate)} — {formatDate(claim.endDate)}</p>
                    </div>
                    <div>
                        <span className="text-sm text-[var(--color-text-secondary)]">Description</span>
                        <p className="whitespace-pre-wrap">{claim.description}</p>
                    </div>
                </div>
            </div>

            {/* Response Form */}
            <form onSubmit={handleSubmit} className="document-card-lg">
                <h2 className="font-semibold mb-6">Your Witness Response</h2>

                {error && (
                    <div className="mb-6 p-3 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <label className="form-label">Your Name *</label>
                    <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-6">
                    <label className="form-label">Your Relationship to {claim.claimantName} *</label>
                    <input
                        type="text"
                        name="relationship"
                        className="form-input"
                        placeholder="e.g., Neighbor, Colleague, Family member"
                        value={formData.relationship}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-6">
                    <label className="form-label">Your Response *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            className={`
                                p-4 rounded-lg border text-center transition-all
                                ${formData.responseType === 'CONFIRM'
                                    ? 'border-success-500 bg-success-50 dark:bg-success-900/30'
                                    : 'border-[var(--color-border)] hover:border-success-300'
                                }
                            `}
                            onClick={() => setFormData(prev => ({ ...prev, responseType: 'CONFIRM' }))}
                        >
                            <svg className="w-8 h-8 mx-auto text-success-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="font-medium mt-2">Confirm</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                I fully verify this claim
                            </p>
                        </button>

                        <button
                            type="button"
                            className={`
                                p-4 rounded-lg border text-center transition-all
                                ${formData.responseType === 'PARTIAL'
                                    ? 'border-warning-500 bg-warning-50 dark:bg-warning-900/30'
                                    : 'border-[var(--color-border)] hover:border-warning-300'
                                }
                            `}
                            onClick={() => setFormData(prev => ({ ...prev, responseType: 'PARTIAL' }))}
                        >
                            <svg className="w-8 h-8 mx-auto text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="font-medium mt-2">Partially Confirm</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                Some details are accurate
                            </p>
                        </button>

                        <button
                            type="button"
                            className={`
                                p-4 rounded-lg border text-center transition-all
                                ${formData.responseType === 'DENY'
                                    ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/30'
                                    : 'border-[var(--color-border)] hover:border-danger-300'
                                }
                            `}
                            onClick={() => setFormData(prev => ({ ...prev, responseType: 'DENY' }))}
                        >
                            <svg className="w-8 h-8 mx-auto text-danger-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="font-medium mt-2">Deny</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                I cannot verify this claim
                            </p>
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="form-label">Additional Comments (Optional)</label>
                    <textarea
                        name="comment"
                        className="form-input min-h-[100px]"
                        placeholder="Any additional details or clarifications..."
                        value={formData.comment}
                        onChange={handleChange}
                    />
                </div>

                {/* Evidence Upload */}
                <div className="mb-8">
                    <label className="form-label">Supporting Evidence (Optional)</label>
                    {evidenceFile ? (
                        <div className="p-4 bg-success-50 dark:bg-success-900/30 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-sm">{evidenceFile.name}</p>
                                        <p className="text-xs text-[var(--color-text-secondary)]">
                                            {(evidenceFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEvidenceFile(null)}
                                    className="text-sm text-danger-600 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="block w-full p-4 border border-dashed border-[var(--color-border)] rounded-lg hover:border-accent-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-colors cursor-pointer">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setEvidenceFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <span className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Upload photo or document (max 5MB)
                            </span>
                        </label>
                    )}
                    <p className="form-helper">You can upload a photo or document to support your verification</p>
                </div>

                <div className="bg-primary-50 dark:bg-primary-900/50 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm">
                            <p className="font-medium">Your response is permanent</p>
                            <p className="text-[var(--color-text-secondary)] mt-1">
                                Once submitted, your response cannot be edited or deleted.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="spinner" />
                            Submitting...
                        </span>
                    ) : (
                        'Submit Witness Response'
                    )}
                </button>
            </form>
        </div>
    );
}
