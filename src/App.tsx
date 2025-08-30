import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import Home from "@/pages/Home";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Overview from "@/pages/dashboard/Overview";
import Analytics from "@/pages/dashboard/Analytics";
import Projects from "@/pages/dashboard/Projects";
import Team from "@/pages/dashboard/Team";

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="projects" element={<Projects />} />
            <Route path="team" element={<Team />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
