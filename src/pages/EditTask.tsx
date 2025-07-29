import { TaskForm } from "@/components/tasks/task-form";
import { useParams } from "react-router-dom";

export default function EditTask() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Task</h2>
        <p className="text-muted-foreground">
          Update the task details.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <TaskForm taskId={id} />
      </div>
    </div>
  );
}