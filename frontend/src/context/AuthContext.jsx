import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, setSessionExpiredHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        checkAuth();

        // Set up session expiry handler
        setSessionExpiredHandler(() => {
            setUser(null);
            setSessionExpired(true);
        });
    }, []);

    const checkAuth = async () => {
        try {
            const response = await auth.getMe();
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, otp) => {
        const response = await auth.verifyOTP(email, otp);
        setUser(response.data.user);
        setSessionExpired(false);
        return response.data;
    };

    const logout = async () => {
        await auth.logout();
        setUser(null);
    };

    const updateName = async (name) => {
        await auth.updateName(name);
        setUser(prev => ({ ...prev, name }));
    };

    const clearSessionExpired = () => {
        setSessionExpired(false);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateName,
        isAuthenticated: !!user,
        sessionExpired,
        clearSessionExpired
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
