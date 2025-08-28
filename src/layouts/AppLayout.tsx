import { Outlet, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";

const AppLayout = () => {
  const location = useLocation();
  
  // Don't show navigation on the home page
  const showNavigation = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation />}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
