const Profile = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-semibold text-muted-foreground">JD</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">John Doe</h2>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                <p className="mt-2 text-sm text-muted-foreground">Frontend Developer</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm font-medium text-foreground">January 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <span className="text-sm font-medium text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasks completed</span>
                  <span className="text-sm font-medium text-foreground">156</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold text-foreground">Personal Information</h3>
              
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      defaultValue="John"
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      defaultValue="Doe"
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    defaultValue="john.doe@example.com"
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    defaultValue="Frontend developer passionate about creating beautiful and functional user interfaces."
                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
