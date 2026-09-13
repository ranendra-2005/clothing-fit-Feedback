import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, brand?: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateSizingProfile: (sizingProfile: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('fitpulse_auth_token');
    const savedUser = localStorage.getItem('fitpulse_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('fitpulse_auth_token');
        localStorage.removeItem('fitpulse_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sign in');
      }

      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('fitpulse_auth_token', data.data.token);
      localStorage.setItem('fitpulse_auth_user', JSON.stringify(data.data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole, brand?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, brand }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('fitpulse_auth_token', data.data.token);
      localStorage.setItem('fitpulse_auth_user', JSON.stringify(data.data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Demo login failed');
      }

      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('fitpulse_auth_token', data.data.token);
      localStorage.setItem('fitpulse_auth_user', JSON.stringify(data.data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fitpulse_auth_token');
    localStorage.removeItem('fitpulse_auth_user');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const updateSizingProfile = async (sizingProfile: any) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/profile/sizing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, sizingProfile }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.data);
        localStorage.setItem('fitpulse_auth_user', JSON.stringify(data.data));
      }
    } catch (err) {
      console.error('Error updating sizing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateSizingProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
