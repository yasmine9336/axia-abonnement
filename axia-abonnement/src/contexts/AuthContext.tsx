import { createContext, useEffect, useState, type ReactNode } from "react";
import axiosInstance from "../api/axiosInstance";

// ─── Types ───────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: "Client" | "Responsable";
  phoneNumber?: string;
  gouvernorat?: string;
  ville?: string;
  nomEntreprise?: string;
  matriculeFiscal?: string;
  secteurActivite?: string;
  adresseProfessionnelle?: string;
  dateNaissance?: string;
  sexe?: string;
}

export interface RegisterResult {
  role: string;
  statut?: string;
  message?: string;
}

export type LoginOutcome =
  | { kind: "success"; role: string }
  | { kind: "pending"; message: string }
  | { kind: "payment_required"; message: string; userId: string }
  | { kind: "rejected"; message: string }
  | { kind: "invalid"; message: string };

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<LoginOutcome>;
  logout: () => void;
  register: (data: RegisterData) => Promise<RegisterResult>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        const storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!token) {
          setUser(null);
          return;
        }

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        } else {
          const meResponse = await axiosInstance.get("/auth/me");
          const userData: User = meResponse.data;
          const remember = localStorage.getItem("rememberMe") === "true";

          if (remember) localStorage.setItem("user", JSON.stringify(userData));
          else sessionStorage.setItem("user", JSON.stringify(userData));

          setUser(userData);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    remember: boolean,
  ): Promise<LoginOutcome> => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
        rememberMe: remember,
      });

      const { accessToken, refreshToken, role } = response.data;

      // Toujours localStorage → fonctionne dans tous les onglets
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      if (remember) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Nettoyer sessionStorage (ancienne logique)
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");

      const meResponse = await axiosInstance.get("/auth/me");
      const userData: User = { ...meResponse.data, role };

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      return { kind: "success", role };
    } catch (err) {
      const error = err as {
        response?: {
          status?: number;
          data?: { message?: string; code?: string; userId?: string };
        };
      };

      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message || "Email ou mot de passe incorrect";

      if (status === 403 && data?.code) {
        switch (data.code) {
          case "PENDING":
            return { kind: "pending", message };
          case "PAYMENT_REQUIRED":
            return {
              kind: "payment_required",
              message,
              userId: data.userId ?? "",
            };
          case "REJECTED":
            return { kind: "rejected", message };
          default:
            return { kind: "invalid", message };
        }
      }

      return { kind: "invalid", message };
    }
  };

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    const response = await axiosInstance.post("/auth/register", data);
    return {
      role: response.data?.role ?? data.role,
      statut: response.data?.statut,
      message: response.data?.message,
    };
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
