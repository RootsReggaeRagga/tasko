import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Task, TaskStatus } from "@/types";
import { KanbanItem } from "./kanban-item";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

const statusConfig = {
  todo: { title: "To Do", color: "bg-slate-100" },
  "in-progress": { title: "In Progress", color: "bg-blue-50" },
  review: { title: "In Review", color: "bg-yellow-50" },
  done: { title: "Done", color: "bg-green-50" }
};

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const config = statusConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-lg border shadow-sm",
        config.color
      )}
    >
      <div className="p-3 border-b bg-opacity-80">
        <h3 className="font-medium text-sm">{config.title}</h3>
        <div className="text-xs text-muted-foreground mt-1">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </div>
      </div>

      <SortableContext
        id={status}
        items={tasks.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-2 overflow-y-auto max-h-[65vh] space-y-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <KanbanItem key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}