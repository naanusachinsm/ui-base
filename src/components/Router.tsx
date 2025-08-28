import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "@/config/routes";

// Lazy load the layout
const AppLayout = lazy(() => import("@/layouts/AppLayout"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error boundary component for route errors
const RouteErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen bg-background">{children}</div>;
};

const AppRouter = () => {
  const HomeComponent = routes[0].component;

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Home route without layout */}
          <Route
            path="/"
            element={
              <RouteErrorBoundary>
                <HomeComponent />
              </RouteErrorBoundary>
            }
          />

          {/* Other routes with layout */}
          <Route
            path="/"
            element={
              <RouteErrorBoundary>
                <AppLayout />
              </RouteErrorBoundary>
            }
          >
            {routes.slice(1).map((route) => {
              const RouteComponent = route.component;
              return (
                <Route
                  key={route.path}
                  path={route.path.replace("/", "")}
                  element={
                    <RouteErrorBoundary>
                      <RouteComponent />
                    </RouteErrorBoundary>
                  }
                />
              );
            })}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
