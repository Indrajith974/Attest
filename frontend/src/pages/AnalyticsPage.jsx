import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AnalyticsPage() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics');
            setAnalytics(response.data.analytics);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h1 className="text-2xl font-bold mt-4">Error Loading Analytics</h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">{error}</p>
                </div>
            </div>
        );
    }

    const { summary, claimsByCategory, responsesByType, recentActivity } = analytics;

    return (
        <div className="document-container">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] inline-flex items-center gap-1 mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                    Overview of your claims and verification statistics
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="document-card text-center">
                    <div className="text-3xl font-bold text-accent-600">{summary.totalClaims}</div>
                    <div className="text-sm text-[var(--color-text-secondary)] mt-1">Total Claims</div>
                </div>
                <div className="document-card text-center">
                    <div className="text-3xl font-bold text-success-600">{summary.totalResponses}</div>
                    <div className="text-sm text-[var(--color-text-secondary)] mt-1">Witness Responses</div>
                </div>
                <div className="document-card text-center">
                    <div className="text-3xl font-bold text-primary-600">{summary.totalEvidence}</div>
                    <div className="text-sm text-[var(--color-text-secondary)] mt-1">Evidence Files</div>
                </div>
                <div className="document-card text-center">
                    <div className="text-3xl font-bold" style={{ color: summary.avgConfidence >= 70 ? 'var(--success-600)' : summary.avgConfidence >= 40 ? 'var(--warning-600)' : 'var(--danger-600)' }}>
                        {summary.avgConfidence}%
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)] mt-1">Avg Confidence</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Claims by Category */}
                <div className="document-card">
                    <h2 className="font-semibold mb-4">Claims by Category</h2>
                    {claimsByCategory.length === 0 ? (
                        <p className="text-[var(--color-text-secondary)] text-center py-8">No claims yet</p>
                    ) : (
                        <div className="space-y-3">
                            {claimsByCategory.map(cat => (
                                <div key={cat.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`badge-${cat.category.toLowerCase()}`}>{cat.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent-500 rounded-full"
                                                style={{ width: `${(cat.count / summary.totalClaims) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-8 text-right">{cat.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Response Breakdown */}
                <div className="document-card">
                    <h2 className="font-semibold mb-4">Witness Response Breakdown</h2>
                    {summary.totalResponses === 0 ? (
                        <p className="text-[var(--color-text-secondary)] text-center py-8">No responses yet</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-success-600 font-medium">Confirmed</span>
                                    <span className="text-sm font-medium">{responsesByType.confirm}</span>
                                </div>
                                <div className="w-full h-3 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-success-500 rounded-full transition-all"
                                        style={{ width: `${(responsesByType.confirm / summary.totalResponses) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-warning-600 font-medium">Partial</span>
                                    <span className="text-sm font-medium">{responsesByType.partial}</span>
                                </div>
                                <div className="w-full h-3 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-warning-500 rounded-full transition-all"
                                        style={{ width: `${(responsesByType.partial / summary.totalResponses) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-danger-600 font-medium">Denied</span>
                                    <span className="text-sm font-medium">{responsesByType.deny}</span>
                                </div>
                                <div className="w-full h-3 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-danger-500 rounded-full transition-all"
                                        style={{ width: `${(responsesByType.deny / summary.totalResponses) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="document-card mt-6">
                <h2 className="font-semibold mb-4">Recent Activity</h2>
                {recentActivity.length === 0 ? (
                    <p className="text-[var(--color-text-secondary)] text-center py-8">No recent activity</p>
                ) : (
                    <div className="space-y-3">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${activity.action === 'CREATED' ? 'bg-accent-500' :
                                            activity.action === 'SUBMITTED' ? 'bg-success-500' :
                                                activity.action === 'UPLOADED' ? 'bg-primary-500' : 'bg-gray-500'
                                        }`} />
                                    <div>
                                        <span className="text-sm font-medium capitalize">{activity.entityType.replace('_', ' ')}</span>
                                        <span className="text-sm text-[var(--color-text-secondary)]"> • {activity.action.toLowerCase()}</span>
                                        {activity.details?.title && (
                                            <span className="text-sm text-[var(--color-text-secondary)]"> • {activity.details.title}</span>
                                        )}
                                        {activity.details?.witnessName && (
                                            <span className="text-sm text-[var(--color-text-secondary)]"> by {activity.details.witnessName}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                    {formatDate(activity.timestamp)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
