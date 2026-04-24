import { createContext, useContext, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

type RoleTheme = "admin" | "client" | "responsable";

interface ThemeContextValue {
  roleTheme: RoleTheme;
  accent: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  roleTheme: "responsable",
  accent: "#4F46E5",
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
      ? "#0F6CBD"
      : roleTheme === "client"
        ? "#0284C7"
        : "#1D4ED8";

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

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
