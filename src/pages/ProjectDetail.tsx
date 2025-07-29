import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Plus, Kanban, ListFilter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { projects, teams, tasks } = useAppStore();
  
  const project = projects.find((p) => p.id === id);
  
  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">Project not found</h3>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/projects')}>View All Projects</Button>
        </div>
      </div>
    );
  }

  const team = teams.find(t => t.id === project.teamId);
  // Get tasks associated with this project by filtering the tasks array
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  
  const statusCounts = {
    todo: projectTasks.filter(t => t.status === 'todo').length,
    inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
    review: projectTasks.filter(t => t.status === 'review').length,
    done: projectTasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => navigate(`/projects/${project.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button 
            size="sm"
            className="gap-1"
            onClick={() => navigate('/new-task', { state: { projectId: project.id } })}
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Created on {formatDate(project.createdAt)}
              </p>
            </div>
            {team && (
              <Badge variant="outline">
                Team: {team.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {project.description || "No description provided."}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-4">Project Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">To Do</div>
                    <Badge className={getStatusColor('todo')}>
                      {statusCounts.todo}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">In Progress</div>
                    <Badge className={getStatusColor('in-progress')}>
                      {statusCounts.inProgress}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">In Review</div>
                    <Badge className={getStatusColor('review')}>
                      {statusCounts.review}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Done</div>
                    <Badge className={getStatusColor('done')}>
                      {statusCounts.done}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Tasks ({projectTasks.length})</h3>
              <div className="flex items-center gap-2">
                <Link to={`/projects/${project.id}/board`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Kanban className="h-4 w-4" />
                    <span>Board View</span>
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/new-task', { state: { projectId: project.id } })}
                >
                  New Task
                </Button>
              </div>
            </div>

            {projectTasks.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-muted-foreground">No tasks created for this project yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectTasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden cursor-pointer" 
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {task.description || "No description"}
                          </div>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}