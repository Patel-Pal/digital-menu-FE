import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type MenuTheme = "coral" | "ocean" | "forest" | "sunset" | "midnight" | "lavender";
export type AppMode = "light" | "dark";

interface ThemeConfig {
  name: string;
  primary: string;
  accent: string;
  preview: string;
}

export const menuThemes: Record<MenuTheme, ThemeConfig> = {
  coral: {
    name: "Coral",
    primary: "16 85% 58%",
    accent: "38 95% 60%",
    preview: "linear-gradient(135deg, hsl(16 85% 58%), hsl(38 95% 60%))",
  },
  ocean: {
    name: "Ocean",
    primary: "200 80% 50%",
    accent: "180 60% 45%",
    preview: "linear-gradient(135deg, hsl(200 80% 50%), hsl(180 60% 45%))",
  },
  forest: {
    name: "Forest",
    primary: "142 60% 40%",
    accent: "85 50% 50%",
    preview: "linear-gradient(135deg, hsl(142 60% 40%), hsl(85 50% 50%))",
  },
  sunset: {
    name: "Sunset",
    primary: "350 80% 55%",
    accent: "30 90% 55%",
    preview: "linear-gradient(135deg, hsl(350 80% 55%), hsl(30 90% 55%))",
  },
  midnight: {
    name: "Midnight",
    primary: "250 70% 55%",
    accent: "280 60% 60%",
    preview: "linear-gradient(135deg, hsl(250 70% 55%), hsl(280 60% 60%))",
  },
  lavender: {
    name: "Lavender",
    primary: "270 60% 60%",
    accent: "320 50% 55%",
    preview: "linear-gradient(135deg, hsl(270 60% 60%), hsl(320 50% 55%))",
  },
};

interface ThemeContextType {
  menuTheme: MenuTheme;
  setMenuTheme: (theme: MenuTheme) => void;
  getThemeStyles: () => { primary: string; accent: string };
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  toggleAppMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [menuTheme, setMenuTheme] = useState<MenuTheme>(() => {
    const saved = localStorage.getItem("menuTheme");
    return (saved as MenuTheme) || "coral";
  });

  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem("appMode");
    if (saved) return saved as AppMode;
    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("menuTheme", menuTheme);
    
    // Apply theme to CSS variables
    const theme = menuThemes[menuTheme];
    document.documentElement.style.setProperty("--menu-primary", theme.primary);
    document.documentElement.style.setProperty("--menu-accent", theme.accent);
  }, [menuTheme]);

  useEffect(() => {
    localStorage.setItem("appMode", appMode);
    
    // Apply dark/light mode
    if (appMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [appMode]);

  const toggleAppMode = () => {
    setAppMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const getThemeStyles = () => menuThemes[menuTheme];

  return (
    <ThemeContext.Provider value={{ menuTheme, setMenuTheme, getThemeStyles, appMode, setAppMode, toggleAppMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useMenuTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useMenuTheme must be used within ThemeProvider");
  }
  return context;
}
