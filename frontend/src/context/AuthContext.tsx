import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  logout: () => void;
  hasRole: (roles: ('ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS')[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await authApi.me();
      if (res.success) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success) {
        const { user: loggedUser, accessToken, refreshToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(loggedUser);
        return loggedUser;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err: any) {
      setUser(null);
      throw err.response?.data?.message || err.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (roles: ('ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS')[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
