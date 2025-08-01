import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { formatDate, formatCurrency, calculateProjectCosts } from "@/lib/utils";
import { useEffect } from "react";

const formatCategory = (category: string) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const navigate = useNavigate();
  const { projects, teams, clients, tasks, currentUser, loadDataFromSupabase } = useAppStore();

  // Load data from Supabase when component mounts
  useEffect(() => {
    if (currentUser) {
      loadDataFromSupabase();
    }
  }, [currentUser, loadDataFromSupabase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0 gap-1"
          onClick={() => navigate('/new-project')}
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create a project to start organizing your tasks.
          </p>
          <Button onClick={() => navigate('/new-project')}>Create Project</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const team = teams.find(t => t.id === project.teamId);
            const client = clients.find(c => c.id === project.clientId);
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'done').length;
            const { totalCost, totalTime } = calculateProjectCosts(projectTasks, project.hourlyRate);
            
            return (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Team: {team?.name || 'No team'}</span>
                    {client && (
                      <span className="ml-2">• Client: {client.company}</span>
                    )}
                    {project.category && (
                      <span className="ml-2">• {formatCategory(project.category)}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Created on {formatDate(project.createdAt)}
                      </div>
                      <Badge variant="outline">
                        {completedTasks}/{project.tasks.length} tasks
                      </Badge>
                    </div>
                    {(project.budget || project.revenue || totalCost > 0) && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Financial:</span>
                        <div className="flex gap-2">
                          {project.budget && (
                            <span className="text-blue-600">Budget: {formatCurrency(project.budget)}</span>
                          )}
                          {project.revenue && (
                            <span className="text-green-600">Revenue: {formatCurrency(project.revenue)}</span>
                          )}
                          {totalCost > 0 && (
                            <span className="text-red-600">Cost: {formatCurrency(totalCost)}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    View details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}