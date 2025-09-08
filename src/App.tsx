import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Home from "@/pages/Home";
import { LoginPage } from "@/pages/login";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { OrganizationsPage } from "@/pages/organization";

import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OrganizationsPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;
