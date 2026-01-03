import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateName } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await updateName(name.trim());
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="document-container">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] inline-flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold mt-4">Profile Settings</h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                    Manage your account settings
                </p>
            </div>

            <div className="document-card-lg max-w-xl">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-6 p-3 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-3 bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-lg text-sm">
                            Profile updated successfully!
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input bg-primary-50 dark:bg-primary-900/50"
                            value={user?.email || ''}
                            disabled
                        />
                        <p className="form-helper">Email cannot be changed</p>
                    </div>

                    <div className="mb-6">
                        <label className="form-label">Display Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <p className="form-helper">This name will appear on your claims and proofs</p>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="spinner" />
                                    Saving...
                                </span>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="document-card mt-6 max-w-xl">
                <h2 className="font-semibold mb-4">Account Information</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[var(--color-text-secondary)]">Member since</span>
                        <span>{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
