import { createContext, useContext, useState, type ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'Client' | 'Responsable';
  phoneNumber?: string;
  nomEntreprise?: string;
  matriculeFiscal?: string;
  secteurActivite?: string;
  adresseProfessionnelle?: string;
}

export interface RegisterResult {
  role: string;
  statut?: string;
  message?: string;
}

export type LoginOutcome =
  | { kind: 'success'; role: string }
  | { kind: 'pending'; message: string }
  | { kind: 'payment_required'; message: string; userId: string }
  | { kind: 'rejected'; message: string }
  | { kind: 'invalid'; message: string };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<LoginOutcome>;
  logout: () => void;
  register: (data: RegisterData) => Promise<RegisterResult>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  const login = async (email: string, password: string, remember: boolean): Promise<LoginOutcome> => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password, rememberMe: remember });
      const { accessToken, refreshToken, role } = response.data;

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

      if (remember) localStorage.setItem('user', JSON.stringify(userData));
      else sessionStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { kind: 'success', role };
    } catch (err) {
      const error = err as {
        response?: {
          status?: number;
          data?: { message?: string; code?: string; userId?: string };
        };
      };
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message || 'Email ou mot de passe incorrect';

      if (status === 403 && data?.code) {
        switch (data.code) {
          case 'PENDING': return { kind: 'pending', message };
          case 'PAYMENT_REQUIRED':
            return { kind: 'payment_required', message, userId: data.userId ?? '' };
          case 'REJECTED': return { kind: 'rejected', message };
          default: return { kind: 'invalid', message };
        }
      }
      return { kind: 'invalid', message };
    }
  };

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    const response = await axiosInstance.post('/auth/register', data);
    return {
      role: response.data?.role ?? data.role,
      statut: response.data?.statut,
      message: response.data?.message,
    };
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
