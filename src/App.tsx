import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Home from "@/pages/Home";
import { LoginPage } from "@/pages/login";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { OrganizationsPage } from "@/pages/organization";
import { EmployeesPage } from "@/pages/employee";
import { StudentsPage } from "@/pages/student";
import { CentersPage } from "@/pages/center";
import { CoursesPage, CourseDetailsPage } from "@/pages/course";
import { CohortsPage, CohortDetailsPage } from "@/pages/cohort";

import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<OrganizationsPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="centers" element={<CentersPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailsPage />} />
            <Route path="cohorts" element={<CohortsPage />} />
            <Route path="cohorts/:id" element={<CohortDetailsPage />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;
