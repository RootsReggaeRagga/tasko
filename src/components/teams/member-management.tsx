import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials } from "@/lib/utils";
import { User } from "@/types";
import { Trash2, Crown, User as UserIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface MemberManagementProps {
  teamId: string;
  members: User[];
}

export function MemberManagement({ teamId, members }: MemberManagementProps) {
  const { removeMemberFromTeam, updateTeam } = useAppStore();
  const { toast } = useToast();
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    setUpdatingMember(memberId);
    
    try {
      // Find the team and update the member's role
      const { teams } = useAppStore.getState();
      const team = teams.find(t => t.id === teamId);
      
      if (team) {
        const updatedMembers = team.members.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        );
        
        updateTeam(teamId, { members: updatedMembers });
        
        toast({
          title: "Role updated",
          description: `Member role has been updated to ${newRole}.`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive"
      });
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = (member: User) => {
    if (members.length <= 1) {
      toast({
        title: "Cannot remove member",
        description: "A team must have at least one member.",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      removeMemberFromTeam(teamId, member.id);
      toast({
        title: "Member removed",
        description: `${member.name} has been removed from the team.`
      });
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Team Members ({members.length})</span>
          {members.length > 0 && (
            <Badge variant="outline">
              {members.filter(m => m.role === 'admin').length} admin
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No members in this team yet.</p>
            <p className="text-sm">Invite members to start collaborating.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(value: 'admin' | 'member') => handleRoleChange(member.id, value)}
                    disabled={updatingMember === member.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>Member</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {members.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveMember(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 