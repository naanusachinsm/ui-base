import { useLocation, useNavigate } from "react-router-dom";
import { routes, findRouteByPath, getProtectedRoutes, getPublicRoutes } from "@/config/routes";

export const useRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoute = findRouteByPath(location.pathname);
  const protectedRoutes = getProtectedRoutes();
  const publicRoutes = getPublicRoutes();

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

  const isCurrentRoute = (path: string) => {
    return location.pathname === path;
  };

  const isProtectedRoute = (path: string) => {
    return protectedRoutes.some(route => route.path === path);
  };

  return {
    currentRoute,
    currentPath: location.pathname,
    protectedRoutes,
    publicRoutes,
    allRoutes: routes,
    navigateTo,
    goBack,
    goHome,
    isCurrentRoute,
    isProtectedRoute,
  };
};
