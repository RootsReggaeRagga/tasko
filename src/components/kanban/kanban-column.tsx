import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task, User, TaskStatus } from "@/types";
import { KanbanItem } from "./kanban-item";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: { id: TaskStatus; label: string; color: string };
  tasks: Task[];
  users: User[];
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragOver: boolean;
}

export function KanbanColumn({ 
  status, 
  tasks, 
  users, 
  onDragStart, 
  onDragEnd, 
  onDrop, 
  isDragOver 
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop();
  };

  return (
    <Card 
      className={cn(
        "min-h-[500px] transition-colors",
        status.color,
        isDragOver && "ring-2 ring-blue-400 ring-opacity-50"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{status.label}</span>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <KanbanItem 
              key={task.id} 
              task={task} 
              users={users}
              onDragStart={() => onDragStart(task)}
              onDragEnd={onDragEnd}
            />
          ))
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
            No tasks
          </div>
        )}
      </CardContent>
    </Card>
  );
}