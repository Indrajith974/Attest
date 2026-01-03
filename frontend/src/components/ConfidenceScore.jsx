export default function ConfidenceScore({ confidence, showBreakdown = false }) {
    const { score, breakdown, explanation } = confidence;

    const getScoreClass = () => {
        if (score >= 70) return 'confidence-high';
        if (score >= 40) return 'confidence-medium';
        return 'confidence-low';
    };

    const getScoreLabel = () => {
        if (score >= 70) return 'High Confidence';
        if (score >= 40) return 'Moderate Confidence';
        return 'Low Confidence';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    Confidence Score
                </span>
                <span className="text-2xl font-bold">{score}/100</span>
            </div>

            <div className="confidence-meter">
                <div
                    className={`confidence-fill ${getScoreClass()}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${score >= 70 ? 'text-success-600' :
                        score >= 40 ? 'text-warning-600' : 'text-danger-600'
                    }`}>
                    {getScoreLabel()}
                </span>
            </div>

            {showBreakdown && breakdown && (
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-sm">
                    <h4 className="font-medium mb-2">Score Breakdown</h4>
                    <div className="space-y-1 text-[var(--color-text-secondary)]">
                        <p>Base score: 40</p>
                        {breakdown.confirmCount > 0 && (
                            <p className="text-success-600">
                                +{breakdown.confirmBonus} from {breakdown.confirmCount} confirmation(s)
                            </p>
                        )}
                        {breakdown.partialCount > 0 && (
                            <p className="text-warning-600">
                                +{breakdown.partialBonus} from {breakdown.partialCount} partial confirmation(s)
                            </p>
                        )}
                        {breakdown.denyCount > 0 && (
                            <p className="text-danger-600">
                                -{breakdown.denyPenalty} from {breakdown.denyCount} denial(s)
                            </p>
                        )}
                        {breakdown.evidenceBonus > 0 && (
                            <p className="text-accent-600">
                                +{breakdown.evidenceBonus} for uploaded evidence
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
