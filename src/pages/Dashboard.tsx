import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { PlusCircle } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, teams, projects } = useAppStore();

  const hasTeam = teams.length > 0;
  const hasProject = projects.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}!
          </p>
        </div>
      </div>

      {(!hasTeam || !hasProject) && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-medium text-lg mb-2">Get Started</h3>
          <p className="text-muted-foreground mb-4">
            Complete these steps to set up your workspace:
          </p>
          <div className="space-y-2">
            {!hasTeam && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => navigate("/new-team")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Team</span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  Create a team to collaborate with others
                </span>
              </div>
            )}
            {!hasProject && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => navigate("/new-project")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Project</span>
                </Button>
                <span className="text-sm text-muted-foreground">
                  Create a project to organize your tasks
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentTasks />
        
        {/* Project Activity Component can be added here */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Quick Links</h3>
          </div>
          <div className="p-6 pt-0 space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/tasks')}
            >
              View All Tasks
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/teams')}
            >
              Manage Teams
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/projects')}
            >
              View Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}