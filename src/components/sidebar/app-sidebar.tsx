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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
      items: [
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
        },
      ],
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "Students",
          url: "/students",
        },
        {
          title: "Employees",
          url: "/employees",
        },
        {
          title: "Roles & Permissions",
          url: "/roles-permissions",
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
          url: "/organizations",
        },
        {
          title: "Centers",
          url: "/centers",
        },
        {
          title: "Settings",
          url: "/settings",
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
          url: "/courses",
        },
        {
          title: "Cohorts",
          url: "/cohorts",
        },
        {
          title: "Classes",
          url: "/classes",
        },
        {
          title: "Enrollments",
          url: "/enrollments",
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
          url: "/enquiries",
        },
        {
          title: "Payments",
          url: "/payments",
        },
        {
          title: "Feedback",
          url: "/feedback",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
