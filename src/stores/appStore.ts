import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AppState {
  // Theme state
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
  }>;
  addNotification: (
    notification: Omit<AppState["notifications"][0], "id">
  ) => void;
  removeNotification: (id: string) => void;

  // Reset store
  reset: () => void;
}

const initialState = {
  theme: "system" as Theme,
  user: null,
  sidebarOpen: false,
  isLoading: false,
  notifications: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),

      setUser: (user) => set({ user }),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      setIsLoading: (isLoading) => set({ isLoading }),

      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = { ...notification, id };
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration (default: 5000ms)
        const duration = notification.duration || 5000;
        setTimeout(() => {
          get().removeNotification(id);
        }, duration);
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      reset: () => set(initialState),
    }),
    {
      name: "app-store",
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
      }),
    }
  )
);
