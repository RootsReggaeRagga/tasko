import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Trello } from "lucide-react";
import { TaskList } from "@/components/tasks/task-list";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { useAppStore } from "@/lib/store";

type ViewMode = "list" | "kanban";

export default function Tasks() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { currentUser, loadDataFromSupabase } = useAppStore();

  // Load data from Supabase when component mounts
  useEffect(() => {
    if (currentUser) {
      loadDataFromSupabase();
    }
  }, [currentUser, loadDataFromSupabase]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks</span>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-1"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="gap-1"
              >
                <Trello className="h-4 w-4" />
                Kanban
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === "list" ? (
            <TaskList />
          ) : (
            <KanbanBoard />
          )}
        </CardContent>
      </Card>
    </div>
  );
}