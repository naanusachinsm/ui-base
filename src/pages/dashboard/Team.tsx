import { TeamDataTable } from "@/components/dashboard/team-data-table";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

const Team = () => {
  // Team data with proper structure matching the teamSchema
  const teamData = [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Marketing Director",
      status: "Online",
      projects: "5",
      capacity: "10",
      department: "Marketing",
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "Email Campaign Manager",
      status: "Away",
      projects: "3",
      capacity: "8",
      department: "Marketing",
    },
    {
      id: 3,
      name: "Carol Davis",
      role: "Design Lead",
      status: "Online",
      projects: "4",
      capacity: "6",
      department: "Design",
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Data Analyst",
      status: "Offline",
      projects: "2",
      capacity: "5",
      department: "Analytics",
    },
    {
      id: 5,
      name: "Eva Brown",
      role: "Content Strategist",
      status: "Online",
      projects: "6",
      capacity: "8",
      department: "Content",
    },
    {
      id: 6,
      name: "Frank Miller",
      role: "Developer",
      status: "Online",
      projects: "3",
      capacity: "5",
      department: "Engineering",
    },
  ];

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
            <p className="text-muted-foreground">
              Manage your team members and their roles in email marketing
              campaigns.
            </p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        <TeamDataTable data={teamData} />
      </div>
    </>
  );
};

export default Team;
