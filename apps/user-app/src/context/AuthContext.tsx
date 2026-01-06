import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the user profile and auth state
interface UserProfile {
    id: number;
    username: string;
    role: 'admin' | 'user';
    milesNumber?: string;
    milesPoints?: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null;
    login: (token: string, user: UserProfile) => void;
    logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('user_token'));

    // Persist user data on initial load if token exists
    // In a real app, you'd verify the token with the backend here
    useState(() => {
        const storedUser = localStorage.getItem('user_profile');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    });

    const login = (newToken: string, userProfile: UserProfile) => {
        localStorage.setItem('user_token', newToken);
        localStorage.setItem('user_profile', JSON.stringify(userProfile));
        setToken(newToken);
        setUser(userProfile);
    };

    const logout = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_profile');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
