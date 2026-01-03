import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claims } from '../services/api';
import ClaimCard from '../components/ClaimCard';

export default function DashboardPage() {
    const [claimsList, setClaimsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await claims.list();
            setClaimsList(response.data.claims);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load claims');
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="document-container">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Claims</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Your immutable, human-verified proofs
                    </p>
                </div>
                <Link to="/claims/new" className="btn-primary">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Claim
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-lg">
                    {error}
                </div>
            )}

            {claimsList.length === 0 ? (
                <div className="document-card text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-xl font-semibold mt-4">No claims yet</h2>
                    <p className="text-[var(--color-text-secondary)] mt-2 mb-6">
                        Create your first claim to start building your proof record
                    </p>
                    <Link to="/claims/new" className="btn-primary">
                        Create Your First Claim
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {claimsList.map(claim => (
                        <ClaimCard key={claim.id} claim={claim} />
                    ))}
                </div>
            )}
        </div>
    );
}
