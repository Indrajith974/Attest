import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-40">
            <div className="max-w-5xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                            Attest
                        </span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        >
                            {theme === 'light' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </button>

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                                    My Claims
                                </Link>
                                <Link to="/analytics" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                                    Analytics
                                </Link>
                                <Link to="/claims/new" className="btn-primary text-sm py-2 px-4">
                                    New Claim
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-[var(--color-border)]">
                                    <Link
                                        to="/profile"
                                        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                                    >
                                        {user?.name || user?.email}
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="text-sm text-[var(--color-text-secondary)] hover:text-danger-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="btn-primary text-sm py-2 px-4">
                                Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
