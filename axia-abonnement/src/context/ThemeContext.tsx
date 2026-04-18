import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

interface Theme { accent: string; }
const ThemeContext = createContext<Theme>({ accent: "#4F46E5" });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const accent =
    user?.role === "Admin" ? "#059669" :
    user?.role === "Client" ? "#0284c7" : "#4F46E5";
  return <ThemeContext.Provider value={{ accent }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
