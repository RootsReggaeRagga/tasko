import React, { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { useAppStore } from "@/lib/store";
import { KanbanColumn } from "./kanban-column";
import { Task, TaskStatus } from "@/types";

interface KanbanBoardProps {
  projectId: string;
}

const statusColumns: TaskStatus[] = ["todo", "in-progress", "testing", "reopen", "done"];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks: allTasks, updateTask } = useAppStore();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Filter tasks by project ID
  useEffect(() => {
    setTasks(allTasks.filter(task => task.projectId === projectId));
  }, [allTasks, projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overColumnId = over.id as TaskStatus;
    
    // If the task was dropped in a different column
    if (overColumnId && statusColumns.includes(overColumnId)) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task && task.status !== overColumnId) {
        updateTask(task.id, { ...task, status: overColumnId });
      }
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((status) => (
          <KanbanColumn 
            key={status} 
            status={status} 
            tasks={getTasksByStatus(status)}
          />
        ))}
      </div>
    </DndContext>
  );
}