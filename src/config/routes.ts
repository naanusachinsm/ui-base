import { lazy } from "react";
import type { ComponentType } from "react";

// Lazy load components for better performance
const Home = lazy(() => import("../pages/Home"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Projects = lazy(() => import("../pages/Projects"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Route configuration interface
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<ComponentType>;
  title: string;
  description?: string;
  icon?: string;
  isProtected?: boolean;
  children?: RouteConfig[];
}

// Main routes configuration
export const routes: RouteConfig[] = [
  {
    path: "/",
    component: Home,
    title: "Home",
    description: "Welcome to UI Base",
    icon: "home",
  },
  {
    path: "/dashboard",
    component: Dashboard,
    title: "Dashboard",
    description: "Main dashboard view",
    icon: "dashboard",
    isProtected: true,
  },
  {
    path: "/projects",
    component: Projects,
    title: "Projects",
    description: "Project management",
    icon: "folder",
    isProtected: true,
  },
  {
    path: "/profile",
    component: Profile,
    title: "Profile",
    description: "User profile settings",
    icon: "user",
    isProtected: true,
  },
  {
    path: "*",
    component: NotFound,
    title: "Not Found",
    description: "Page not found",
  },
];

// Navigation menu items (for sidebar/navbar)
export const navigationItems = routes.filter(
  (route) => route.path !== "*" && route.path !== "/"
);

// Helper function to find route by path
export const findRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find((route) => route.path === path);
};

// Helper function to get all protected routes
export const getProtectedRoutes = (): RouteConfig[] => {
  return routes.filter((route) => route.isProtected);
};

// Helper function to get public routes
export const getPublicRoutes = (): RouteConfig[] => {
  return routes.filter((route) => !route.isProtected && route.path !== "*");
};
