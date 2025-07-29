import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function RecentTasks() {
  const navigate = useNavigate();
  const { tasks, users } = useAppStore();
  
  // Get latest 5 tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (recentTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>No tasks created yet.</p>
            <Button 
              className="mt-2"
              variant="outline"
              onClick={() => navigate('/new-task')}
            >
              Create your first task
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.map((task) => {
            const assignee = users.find((u) => u.id === task.assigneeId);
            return (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className="space-y-1">
                  <div className="font-medium">{task.title}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.dueDate && (
                    <div className="text-sm text-muted-foreground">
                      Due {formatDate(task.dueDate)}
                    </div>
                  )}
                  {assignee && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignee.avatar} alt={assignee.name} />
                      <AvatarFallback>{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            );
          })}
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate('/tasks')}
          >
            View all tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}