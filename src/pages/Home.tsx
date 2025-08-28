import { APP_CONFIG } from "@/config";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to {APP_CONFIG.name}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {APP_CONFIG.description}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/dashboard"
              className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Get started
            </a>
            <a
              href="/projects"
              className="text-sm font-semibold leading-6 text-foreground"
            >
              View Projects <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
