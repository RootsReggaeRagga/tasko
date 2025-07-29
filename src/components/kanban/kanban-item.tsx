import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task, User } from "@/types";
import { formatDate, getInitials, getPriorityColor, formatDuration } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface KanbanItemProps {
  task: Task;
  users: User[];
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function KanbanItem({ task, users, onDragStart, onDragEnd }: KanbanItemProps) {
  const navigate = useNavigate();
  const assignee = users.find(u => u.id === task.assigneeId);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    onDragStart();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    onDragEnd();
  };

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Title and Priority */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2 flex-1">
              {task.title}
            </h4>
            <Badge 
              className={cn("text-xs shrink-0", getPriorityColor(task.priority))}
            >
              {task.priority}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Time tracking */}
          {task.timeSpent && task.timeSpent > 0 && (
            <div className="text-xs text-muted-foreground">
              ⏱️ {formatDuration(task.timeSpent)}
            </div>
          )}

          {/* Due date */}
          {task.dueDate && (
            <div className="text-xs text-muted-foreground">
              📅 {formatDate(task.dueDate)}
            </div>
          )}

          {/* Assignee */}
          <div className="flex items-center justify-between">
            {assignee ? (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={assignee.avatar} alt={assignee.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {assignee.name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Unassigned
              </span>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}