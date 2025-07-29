import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  formatDate, 
  getInitials, 
  getStatusColor, 
  getPriorityColor
} from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { TaskTimer } from "@/components/tasks/task-timer";
import { TimeTrackingHistory } from "@/components/tasks/time-tracking-history";

export default function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { tasks, users, projects, deleteTask } = useAppStore();
  
  const task = tasks.find((t) => t.id === id);
  
  if (!task) {
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
          <h3 className="font-medium text-lg mb-2">Task not found</h3>
          <p className="text-muted-foreground mb-4">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/tasks')}>View All Tasks</Button>
        </div>
      </div>
    );
  }

  const assignee = users.find((u) => u.id === task.assigneeId);
  const creator = users.find((u) => u.id === task.createdById);
  const project = projects.find((p) => p.id === task.projectId);

  const handleDelete = () => {
    deleteTask(task.id);
    navigate('/tasks');
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
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button 
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <h2 className="text-2xl font-bold">{task.title}</h2>
              <div className="flex gap-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('-', ' ')}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TaskTimer taskId={task.id} />
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Project:</span>
                    <span>{project?.name || "None"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span>{formatDate(task.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Updated:</span>
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                  {task.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">People</h3>
                <div className="space-y-4">
                  {assignee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assignee:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.avatar} alt={assignee.name} />
                          <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                        </Avatar>
                        <span>{assignee.name}</span>
                      </div>
                    </div>
                  )}
                  {creator && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created by:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{getInitials(creator.name)}</AvatarFallback>
                        </Avatar>
                        <span>{creator.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {task.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Time Tracking History Component */}
            {task.timeTracking && task.timeTracking.length > 0 && (
              <TimeTrackingHistory records={task.timeTracking} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}