import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { formatDate, getInitials } from "@/lib/utils";
import { Team } from "@/types";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate();
  const { deleteTeam, projects } = useAppStore();
  const { toast } = useToast();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{team.name}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {team.members.length} members
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(`/teams/${team.id}/invite`)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    const teamProjects = projects.filter(p => p.teamId === team.id);
                    if (teamProjects.length > 0) {
                      toast({
                        title: "Cannot delete team",
                        description: `This team has ${teamProjects.length} project(s). Please delete or reassign projects first.`,
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    if (confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) {
                      deleteTeam(team.id);
                      toast({
                        title: "Team deleted",
                        description: `Team "${team.name}" has been deleted.`
                      });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {team.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Created on {formatDate(team.createdAt)}
          </div>
          {team.members.length > 0 && (
            <AvatarGroup>
              {team.members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          View details
        </Button>
      </CardFooter>
    </Card>
  );
}