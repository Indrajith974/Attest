import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateClaimPage from './pages/CreateClaimPage';
import ClaimDetailPage from './pages/ClaimDetailPage';
import WitnessFormPage from './pages/WitnessFormPage';
import PublicProofPage from './pages/PublicProofPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner text-accent-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

// Layout with header for authenticated pages
function AuthenticatedLayout({ children }) {
    return (
        <>
            <Header />
            <main>{children}</main>
        </>
    );
}

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner text-accent-500" />
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route path="/witness/:token" element={<WitnessFormPage />} />
            <Route path="/proof/:claimId" element={<PublicProofPage />} />

            {/* Protected routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <DashboardPage />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/claims/new"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <CreateClaimPage />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/claims/:id"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <ClaimDetailPage />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <ProfilePage />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <AuthenticatedLayout>
                            <AnalyticsPage />
                        </AuthenticatedLayout>
                    </ProtectedRoute>
                }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ThemeProvider>
    );
}
