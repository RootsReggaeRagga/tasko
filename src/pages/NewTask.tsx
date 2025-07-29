import { TaskForm } from "@/components/tasks/task-form";

export default function NewTask() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create New Task</h2>
        <p className="text-muted-foreground">
          Add a new task to your project.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <TaskForm />
      </div>
    </div>
  );
}