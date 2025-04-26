'use client';

import React, { createContext, useContext } from 'react';
import { usePrivy } from '@privy-io/react-auth';


interface AuthContextType {
    user: { privy_id: string; email: string; wallet_addr: string } | null;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { authenticated, login, logout, user } = usePrivy();

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: authenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuthState = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthState must be used within an AuthProvider');
    }
    return context;
};
