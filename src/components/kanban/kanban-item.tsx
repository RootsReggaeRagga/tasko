import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/types";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface KanbanItemProps {
  task: Task;
}

const priorityConfig = {
  low: { color: "bg-slate-100 text-slate-800 hover:bg-slate-200" },
  medium: { color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  high: { color: "bg-red-100 text-red-800 hover:bg-red-200" }
};

export function KanbanItem({ task }: KanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab"
  };

  const priorityStyle = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Link to={`/tasks/${task.id}`}>
        <Card className="hover:border-primary cursor-grab active:cursor-grabbing hover:bg-accent/40 transition-all">
          <CardContent className="p-3">
            <div className="font-medium text-sm line-clamp-1">{task.title}</div>
            
            {task.description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <Badge variant="outline" className={cn(priorityStyle.color, "capitalize")}>
                {task.priority}
              </Badge>
              
              {task.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  <span>{format(new Date(task.dueDate), "MMM d")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}