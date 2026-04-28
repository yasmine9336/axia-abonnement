import { createContext, useContext, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

type RoleTheme = "admin" | "client" | "responsable";

interface ThemeContextValue {
  roleTheme: RoleTheme;
  accent: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  roleTheme: "responsable",
  accent: "#3d5afe",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const roleTheme: RoleTheme =
    user?.role === "Admin"
      ? "admin"
      : user?.role === "Client"
        ? "client"
        : "responsable";

  const accent =
    roleTheme === "admin"
      ? "#3d5afe"
      : roleTheme === "client"
        ? "#2979ff"
        : "#3d5afe";

  useEffect(() => {
    document.body.classList.remove(
      "theme-admin",
      "theme-client",
      "theme-responsable",
    );
    document.body.classList.add(`theme-${roleTheme}`);
  }, [roleTheme]);

  return (
    <ThemeContext.Provider value={{ roleTheme, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
