import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAuthToken } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, prefs?: string[]) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (categories: string[]) => Promise<void>;
  setGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      const { user: userData, accessToken } = res.data.data;
      setUser(userData);
      setToken(accessToken);
      setAuthToken(accessToken);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, prefs?: string[]) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password: pass, preferredCategories: prefs });
      const { user: userData, accessToken } = res.data.data;
      setUser(userData);
      setToken(accessToken);
      setAuthToken(accessToken);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {}
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setIsGuest(true);
  };

  const updatePreferences = async (categories: string[]) => {
    if (!user) return;
    const res = await api.put('/users/me/interests', { preferredCategories: categories });
    setUser({ ...user, preferredCategories: categories, onboardingCompleted: true });
  };

  const setGuestMode = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isGuest,
        login,
        register,
        logout,
        updatePreferences,
        setGuestMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
