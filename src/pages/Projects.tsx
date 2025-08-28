const Projects = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and tasks</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sample Project Cards */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">UI Base Project</h3>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                Active
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Modern React UI component library with TypeScript and Tailwind CSS
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Progress:</span> 75%
              </div>
              <div className="h-2 w-20 rounded-full bg-muted">
                <div className="h-2 w-3/4 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Dashboard App</h3>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                Planning
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Analytics dashboard with real-time data visualization
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Progress:</span> 25%
              </div>
              <div className="h-2 w-20 rounded-full bg-muted">
                <div className="h-2 w-1/4 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">E-commerce Platform</h3>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                In Review
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Full-stack e-commerce solution with payment integration
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Progress:</span> 90%
              </div>
              <div className="h-2 w-20 rounded-full bg-muted">
                <div className="h-2 w-[90%] rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Project Button */}
        <div className="mt-8">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            + Add New Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default Projects;
