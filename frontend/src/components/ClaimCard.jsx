import { Link } from 'react-router-dom';

export default function ClaimCard({ claim }) {
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

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Present';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    };

    const getConfidenceColor = (score) => {
        if (score >= 70) return 'text-success-600';
        if (score >= 40) return 'text-warning-600';
        return 'text-danger-600';
    };

    return (
        <Link
            to={`/claims/${claim.id}`}
            className="document-card block hover:shadow-document-lg transition-shadow"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={getCategoryBadgeClass(claim.category)}>
                            {claim.category}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold truncate">{claim.title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1 line-clamp-2">
                        {claim.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-[var(--color-text-secondary)]">
                        <span>{formatDate(claim.start_date)} — {formatDate(claim.end_date)}</span>
                        <span>•</span>
                        <span>{claim.evidence_count || 0} evidence</span>
                        <span>•</span>
                        <span>{claim.witness_count || 0} witnesses</span>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className={`text-2xl font-bold ${getConfidenceColor(claim.confidence?.score || 40)}`}>
                        {claim.confidence?.score || 40}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                        confidence
                    </div>
                </div>
            </div>
        </Link>
    );
}
