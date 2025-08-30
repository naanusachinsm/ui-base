import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconFolder,
  IconUsers,
  IconCalendar,
} from "@tabler/icons-react";

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: "Email Campaign Redesign",
      description:
        "Redesign the main email campaign templates for better engagement",
      status: "In Progress",
      team: ["Alice Johnson", "Bob Smith", "Carol Davis"],
      dueDate: "2024-02-15",
      progress: 65,
    },
    {
      id: 2,
      name: "Analytics Dashboard",
      description:
        "Create a comprehensive analytics dashboard for campaign performance",
      status: "Completed",
      team: ["David Wilson", "Eva Brown"],
      dueDate: "2024-01-30",
      progress: 100,
    },
    {
      id: 3,
      name: "Mobile App Integration",
      description: "Integrate email campaigns with the mobile application",
      status: "Planning",
      team: ["Frank Miller", "Grace Lee", "Henry Taylor"],
      dueDate: "2024-03-01",
      progress: 25,
    },
    {
      id: 4,
      name: "A/B Testing Framework",
      description:
        "Implement a robust A/B testing framework for email campaigns",
      status: "In Progress",
      team: ["Ivy Chen", "Jack Anderson"],
      dueDate: "2024-02-28",
      progress: 45,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Active Projects
            </h2>
            <p className="text-muted-foreground">
              Manage your email marketing projects and campaigns.
            </p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconFolder className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <IconUsers className="h-4 w-4" />
                  <span>{project.team.length} team members</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <IconCalendar className="h-4 w-4" />
                  <span>
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Projects;
