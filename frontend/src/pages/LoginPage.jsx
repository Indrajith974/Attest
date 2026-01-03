import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [step, setStep] = useState('email'); // email | otp
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [devMode, setDevMode] = useState(false);

    const from = location.state?.from?.pathname || '/';

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await auth.requestOTP(email);
            setDevMode(response.data.dev);
            setStep('otp');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await login(email, otp);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-cyan-500/5 -z-10" />

            <div className="document-card-lg max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                        <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mt-4">
                        <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                            Attest
                        </span>
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-2">
                        Sign in to create and manage your claims
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {step === 'email' ? (
                    <form onSubmit={handleRequestOTP}>
                        <div className="mb-6">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                            <p className="form-helper">
                                We'll send you a verification code
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="spinner" />
                                    Sending...
                                </span>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="mb-6">
                            <label className="form-label">Verification Code</label>
                            <input
                                type="text"
                                className="form-input text-center text-2xl tracking-widest"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                autoFocus
                            />
                            <p className="form-helper">
                                Enter the 6-digit code sent to <strong>{email}</strong>
                            </p>
                            {devMode && (
                                <p className="text-xs text-accent-600 mt-2">
                                    💡 Dev mode: Check the server console for OTP
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="spinner" />
                                    Verifying...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('email');
                                setOtp('');
                                setError(null);
                            }}
                            className="btn-ghost w-full mt-3"
                        >
                            Use a different email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
