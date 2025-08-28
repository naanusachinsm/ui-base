// Application configuration constants
export const APP_CONFIG = {
  name: "UI Base",
  version: "1.0.0",
  description: "Modern React UI Component Library",
} as const;

export const API_CONFIG = {
  baseUrl: process.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 10000,
} as const;

export const THEME_CONFIG = {
  defaultTheme: "light",
  themes: ["light", "dark", "system"] as const,
} as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;
