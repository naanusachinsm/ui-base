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

// Navigation data
const navData = {
  navMain: [
    {
      title: "Analytics",
      url: "#",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard/overview",
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
        },
      ],
    },
    {
      title: "Organization",
      url: "#",
      icon: Building2,
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
      items: [
        {
          title: "Students",
          url: "/dashboard/students",
        },
        {
          title: "Employees",
          url: "/dashboard/employees",
        },
        {
          title: "Roles & Permissions",
          url: "/dashboard/roles-permissions",
        },
      ],
    },
    {
      title: "Academic",
      url: "#",
      icon: GraduationCap,
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
          url: "/dashboard/feedback",
        },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: Command,
      items: [
        {
          title: "Audit Logs",
          url: "/dashboard/audit-logs",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppStore((state) => state.user);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch organizations on component mount
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await organizationService.getOrganizations({ limit: 10 });
        
        if (OrganizationHelpers.isGetOrganizationsSuccess(response)) {
          const orgsData = OrganizationHelpers.getOrganizationsFromResponse(response);
          // Transform API data to match expected format
          const transformedOrgs: Organization[] = orgsData.map((org, index) => ({
            id: org.id,
            name: org.name,
            logo: [GalleryVerticalEnd, AudioWaveform, Building2][index % 3],
            plan: org.status || 'Active'
          }));
          setOrganizations(transformedOrgs);
        } else {
          // Handle API error response
          console.error('Failed to fetch organizations:', response.message);
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
        console.error('Failed to fetch organizations:', error);
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
