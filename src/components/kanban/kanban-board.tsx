import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { Task, User, TaskStatus } from "@/types";
import { formatDate, getInitials, getStatusColor, getPriorityColor } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { KanbanColumn } from "./kanban-column";
import { KanbanItem } from "./kanban-item";

interface KanbanBoardProps {
  projectId?: string;
}

const STATUSES: Array<{ id: TaskStatus; label: string; color: string }> = [
  { id: "todo", label: "To Do", color: "bg-gray-100" },
  { id: "in-progress", label: "In Progress", color: "bg-blue-100" },
  { id: "testing", label: "Testing", color: "bg-purple-100" },
  { id: "reopen", label: "Reopen", color: "bg-red-100" },
  { id: "review", label: "Review", color: "bg-yellow-100" },
  { id: "done", label: "Done", color: "bg-green-100" }
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const navigate = useNavigate();
  const { tasks, users, projects } = useAppStore();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Filter tasks by project if projectId is provided
  const filteredTasks = projectId 
    ? tasks.filter(task => task.projectId === projectId)
    : tasks;

  // Group tasks by status
  const tasksByStatus = STATUSES.reduce((acc, status) => {
    acc[status.id] = filteredTasks.filter(task => task.status === status.id);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      // Update task status in store
      const { updateTask } = useAppStore.getState();
      updateTask(draggedTask.id, { ...draggedTask, status });
    }
    setDraggedTask(null);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {projectId ? getProjectName(projectId) : "All Tasks"} - Kanban Board
          </h2>
          <p className="text-muted-foreground">
            Drag and drop tasks to change their status
          </p>
        </div>
        <Button onClick={() => navigate('/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            tasks={tasksByStatus[status.id] || []}
            users={users}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(status.id)}
            isDragOver={draggedTask?.status !== status.id}
          />
        ))}
      </div>
    </div>
  );
}