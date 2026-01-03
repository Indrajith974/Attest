export default function Timeline({ events }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionLabel = (event) => {
        const labels = {
            'CREATED': event.entityType === 'claim' ? 'Claim created' :
                event.entityType === 'witness_invite' ? 'Witness invited' : 'Created',
            'UPLOADED': 'Evidence uploaded',
            'SUBMITTED': 'Witness response submitted',
            'LOGIN': 'User logged in',
            'LOGOUT': 'User logged out'
        };
        return labels[event.action] || event.action;
    };

    const getActionIcon = (event) => {
        if (event.entityType === 'claim') {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                </svg>
            );
        }
        if (event.entityType === 'evidence') {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        }
        if (event.entityType === 'witness_invite' || event.entityType === 'witness_response') {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
            );
        }
        return null;
    };

    if (!events || events.length === 0) {
        return (
            <p className="text-[var(--color-text-secondary)] text-sm">
                No timeline events yet.
            </p>
        );
    }

    return (
        <div className="timeline">
            {events.map((event, index) => (
                <div key={event.id || index} className="timeline-item">
                    <div className="flex items-start gap-3">
                        <div className="text-accent-600 dark:text-accent-400">
                            {getActionIcon(event)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                                {getActionLabel(event)}
                            </p>
                            {event.details && (
                                <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
                                    {event.details.witnessName && `By ${event.details.witnessName}`}
                                    {event.details.fileName && `File: ${event.details.fileName}`}
                                    {event.details.responseType && `Response: ${event.details.responseType}`}
                                </p>
                            )}
                            <p className="text-[var(--color-text-secondary)] text-xs mt-1">
                                {formatDate(event.timestamp)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
