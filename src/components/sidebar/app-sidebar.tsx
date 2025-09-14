"use client";

import * as React from "react";
import {
  AudioWaveform,
  BarChart3,
  Building2,
  Command,
  GalleryVerticalEnd,
  GraduationCap,
  PieChart,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { useAppStore } from "@/stores/appStore";
import { organizationService, OrganizationHelpers } from "@/api";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Organization interface
interface Organization {
  id: number;
  name: string;
  logo: React.ComponentType;
  plan: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppStore((state) => state.user);
  const location = useLocation();
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Navigation data with dynamic active state
  const navData = React.useMemo(
    () => ({
      navMain: [
        {
          title: "Analytics",
          url: "#",
          icon: BarChart3,
          isActive: location.pathname.startsWith("/dashboard/overview"),
          items: [
            {
              title: "Overview",
              url: "/dashboard/overview",
            },
          ],
        },
        {
          title: "Organization",
          url: "#",
          icon: Building2,
          isActive:
            location.pathname.startsWith("/dashboard/organizations") ||
            location.pathname.startsWith("/dashboard/centers") ||
            location.pathname === "/dashboard",
          items: [
            {
              title: "Organizations",
              url: "/dashboard/organizations",
            },
            {
              title: "Centers",
              url: "/dashboard/centers",
            },
          ],
        },
        {
          title: "User Management",
          url: "#",
          icon: Users,
          isActive:
            location.pathname.startsWith("/dashboard/students") ||
            location.pathname.startsWith("/dashboard/employees"),
          items: [
            {
              title: "Students",
              url: "/dashboard/students",
            },
            {
              title: "Employees",
              url: "/dashboard/employees",
            },
          ],
        },
        {
          title: "Academic",
          url: "#",
          icon: GraduationCap,
          isActive:
            location.pathname.startsWith("/dashboard/courses") ||
            location.pathname.startsWith("/dashboard/cohorts") ||
            location.pathname.startsWith("/dashboard/classes") ||
            location.pathname.startsWith("/dashboard/enrollments"),
          items: [
            {
              title: "Courses",
              url: "/dashboard/courses",
            },
            {
              title: "Cohorts",
              url: "/dashboard/cohorts",
            },
            {
              title: "Classes",
              url: "/dashboard/classes",
            },
            {
              title: "Enrollments",
              url: "/dashboard/enrollments",
            },
          ],
        },
        {
          title: "Business",
          url: "#",
          icon: PieChart,
          isActive:
            location.pathname.startsWith("/dashboard/enquiries") ||
            location.pathname.startsWith("/dashboard/payments") ||
            location.pathname.startsWith("/dashboard/feedbacks"),
          items: [
            {
              title: "Enquiries",
              url: "/dashboard/enquiries",
            },
            {
              title: "Payments",
              url: "/dashboard/payments",
            },
            {
              title: "Feedback",
              url: "/dashboard/feedbacks",
            },
          ],
        },
        {
          title: "System",
          url: "#",
          icon: Command,
          isActive: location.pathname.startsWith("/dashboard/audit-logs"),
          items: [
            {
              title: "Audit Logs",
              url: "/dashboard/audit-logs",
            },
          ],
        },
      ],
    }),
    [location.pathname]
  );

  // Fetch organizations on component mount
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);

        // Debug: Check authentication status before making API call

        const response = await organizationService.getOrganizations({
          limit: 10,
        });

        if (OrganizationHelpers.isGetOrganizationsSuccess(response)) {
          const orgsData =
            OrganizationHelpers.getOrganizationsFromResponse(response);
          // Transform API data to match expected format
          const transformedOrgs: Organization[] = orgsData.map(
            (org, index) => ({
              id: org.id,
              name: org.name,
              logo: [GalleryVerticalEnd, AudioWaveform, Building2][index % 3],
              plan: org.status || "Active",
            })
          );
          setOrganizations(transformedOrgs);
        } else {
          // Handle API error response
          console.error("Failed to fetch organizations:", response.message);
          setOrganizations([
            {
              id: 1,
              name: "Default Organization",
              logo: Building2,
              plan: "Active",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        // Fallback to default organizations if API fails
        setOrganizations([
          {
            id: 1,
            name: "Default Organization",
            logo: Building2,
            plan: "Active",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={organizations} loading={loading} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
