import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<string>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean): Promise<string> => {
    const response = await axiosInstance.post('/auth/login', { email, password, rememberMe: remember });
    const { accessToken, refreshToken, role } = response.data;

    // ✅ accessToken aussi dans le bon storage
    if (remember) {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('rememberMe', 'true');
    } else {
      sessionStorage.setItem('accessToken', accessToken);
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
      localStorage.removeItem('rememberMe');
    }

    const meResponse = await axiosInstance.get('/auth/me');
    const userData: User = { ...meResponse.data, role };

    if (remember) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData));
    }

    setUser(userData);
    return role;
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    await axiosInstance.post('/auth/register', { username, email, password });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}