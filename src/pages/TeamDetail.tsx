import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, getInitials } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, UserPlus, Trash2 } from "lucide-react";
import { MemberManagement } from "@/components/teams/member-management";

export default function TeamDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { teams, projects, removeMemberFromTeam, deleteTeam } = useAppStore();
  
  const team = teams.find((t) => t.id === id);
  
  if (!team) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">Team not found</h3>
          <p className="text-muted-foreground mb-4">
            The team you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/teams')}>View All Teams</Button>
        </div>
      </div>
    );
  }

  const teamProjects = projects.filter((p) => p.teamId === team.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => navigate(`/teams/${team.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button 
            size="sm"
            className="gap-1"
            onClick={() => navigate(`/teams/${team.id}/invite`)}
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
          <Button 
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() => {
              const teamProjects = projects.filter(p => p.teamId === team.id);
              if (teamProjects.length > 0) {
                alert(`Cannot delete team. This team has ${teamProjects.length} project(s). Please delete or reassign projects first.`);
                return;
              }
              
              if (confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) {
                deleteTeam(team.id);
                navigate('/teams');
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Team</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Created on {formatDate(team.createdAt)}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {team.description || "No description provided."}
            </p>
          </div>

          <MemberManagement teamId={team.id} members={team.members} />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Projects ({teamProjects.length})</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/new-project')}
              >
                New Project
              </Button>
            </div>

            {teamProjects.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-muted-foreground">No projects created for this team yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {teamProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden cursor-pointer" 
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {project.description || "No description"}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {project.tasks.length} tasks
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}