import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { formatDate, getInitials } from "@/lib/utils";
import { Team } from "@/types";
import { useNavigate } from "react-router-dom";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{team.name}</span>
          <Badge variant="outline" className="ml-2">
            {team.members.length} members
          </Badge>
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