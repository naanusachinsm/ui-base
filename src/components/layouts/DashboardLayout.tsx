import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLocation, Outlet } from "react-router-dom";
import { useMemo } from "react";

// Navigation data for breadcrumb generation
const navData = {
  navMain: [
    {
      title: "Analytics",
      url: "#",
      items: [
        { title: "Overview", url: "/dashboard/overview" },
        { title: "Notifications", url: "/dashboard/notifications" },
      ],
    },
    {
      title: "Organization",
      url: "#",
      items: [
        { title: "Organizations", url: "/dashboard/organizations" },
        { title: "Centers", url: "/dashboard/centers" },
      ],
    },
    {
      title: "User Management",
      url: "#",
      items: [
        { title: "Students", url: "/dashboard/students" },
        { title: "Employees", url: "/dashboard/employees" },
      ],
    },
    {
      title: "Academic",
      url: "#",
      items: [
        { title: "Courses", url: "/dashboard/courses" },
        { title: "Cohorts", url: "/dashboard/cohorts" },
        { title: "Classes", url: "/dashboard/classes" },
        { title: "Enrollments", url: "/dashboard/enrollments" },
      ],
    },
    {
      title: "Business",
      url: "#",
      items: [
        { title: "Enquiries", url: "/dashboard/enquiries" },
        { title: "Payments", url: "/dashboard/payments" },
        { title: "Feedback", url: "/dashboard/feedback" },
      ],
    },
    {
      title: "System",
      url: "#",
      items: [{ title: "Audit Logs", url: "/dashboard/audit-logs" }],
    },
  ],
};

interface BreadcrumbItem {
  title: string;
  url?: string;
  isCurrentPage?: boolean;
}

export default function DashboardLayout() {
  const location = useLocation();

  // Generate dynamic breadcrumbs based on current path
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbItems.push({ title: "Dashboard", url: "/dashboard" });

    // If we're on the main dashboard page or organizations (default), show Organizations
    if (path === "/dashboard" || path === "/dashboard/organizations") {
      breadcrumbItems.push({ title: "Organizations", isCurrentPage: true });
      return breadcrumbItems;
    }

    // Find the matching navigation item
    for (const section of navData.navMain) {
      const matchingItem = section.items?.find((item) => item.url === path);
      if (matchingItem) {
        // Add section as intermediate breadcrumb
        breadcrumbItems.push({ title: section.title });
        // Add current page
        breadcrumbItems.push({
          title: matchingItem.title,
          isCurrentPage: true,
        });
        break;
      }
    }

    // If no match found, generate from path segments
    if (breadcrumbItems.length === 1) {
      const segments = path.split("/").filter(Boolean).slice(1); // Remove 'dashboard'
      segments.forEach((segment, index) => {
        const title = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        breadcrumbItems.push({
          title,
          isCurrentPage: index === segments.length - 1,
        });
      });
    }

    return breadcrumbItems;
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <div key={item.title} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                    <BreadcrumbItem>
                      {item.isCurrentPage ? (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.url || "#"}>
                          {item.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 py-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
