import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ListFilter, CalendarRange, Kanban, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects } = useAppStore();

  if (!projectId) {
    return <div>Project ID is required</div>;
  }

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">
          The project you are looking for does not exist.
        </p>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={`/new-task?projectId=${projectId}`}>
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" /> New Task
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">
            <Kanban className="h-4 w-4 mr-1" /> Board
          </TabsTrigger>
          <TabsTrigger value="list" onClick={() => navigate(`/projects/${projectId}`)}>
            <ListFilter className="h-4 w-4 mr-1" /> List
          </TabsTrigger>
          <TabsTrigger value="timeline" disabled>
            <CalendarRange className="h-4 w-4 mr-1" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="members" disabled>
            <Users className="h-4 w-4 mr-1" /> Members
          </TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-6">
          <KanbanBoard projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}