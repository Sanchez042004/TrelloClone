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
        const checkAuth = async () => {
            try {
                // Try to verify session (cookie)
                // We expect the verify endpoint to return user data or successful status
                // The current controller returns 'true' which is valid JSON
                // Ideally it should return the user object.
                // Let's assume for now valid session means we are logged in.

                // wait, verify controller currently just returns true. 
                // We don't get the user object back on refresh!
                // We should fix verify controller to return user.

                // For now, let's keep the logic simple: if verify succeeds, we are good. 
                // But we lost the user info if we don't persist it or fetch it.
                // The original code stored user in localStorage. We can keep user in localStorage for UI purposes
                // but NOT the token.

                await verifyToken();

                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                // If verify fails, clear user
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Guest ID logic via HTTP-only cookie endpoint
        const initGuestSession = async () => {
            try {
                // If we aren't loading and don't have a user, ensure we have a guest session cookie
                const storedUser = localStorage.getItem('user');
                if (!storedUser) {
                    const res = await getGuestSession();
                    if (res.data?.guestId) {
                        setGuestId(res.data.guestId);
                    }
                } else {
                    setGuestId(null);
                }
            } catch (err) {
                console.error("Could not initialize guest session", err);
            }
        };

        // Run both checks
        checkAuth().then(() => initGuestSession());
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
