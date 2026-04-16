import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { verifyToken, logout as apiLogout, getGuestSession } from '../services/api';

interface User {
    id: number;
    email: string;
    // Add other user properties here if needed
}

interface AuthContextType {
    user: User | null;
    token: string | null; // We can keep this for compatibility if components use it, but it will be empty/unused for validation
    guestId: string | null;
    setAuth: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    guestId: null,
    setAuth: () => { },
    logout: () => { },
    isAuthenticated: false,
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // guestId logic remains for non-logged in users
    const [guestId, setGuestId] = useState<string | null>(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                // parallel checks
                const [authRes, guestRes] = await Promise.all([
                    verifyToken().catch(() => null),
                    getGuestSession().catch(() => null)
                ]);

                if (authRes) {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                } else {
                    localStorage.removeItem('user');
                    setUser(null);
                }

                if (guestRes?.data?.guestId) {
                    setGuestId(guestRes.data.guestId);
                }
            } catch (err) {
                console.error("Initialization error", err);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    const setAuth = (newUser: User) => {
        // We don't store token in localStorage anymore
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout failed', error);
        }
        localStorage.removeItem('user');
        setUser(null);
        setGuestId(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token: null, // No accessible token in JS
                guestId,
                setAuth,
                logout,
                isAuthenticated: !!user,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
