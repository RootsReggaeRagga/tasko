import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { formatDate, getInitials } from "@/lib/utils";
import { Mail, Clock, CheckCircle, XCircle, Trash2, Copy } from "lucide-react";
import { useState } from "react";

interface InvitationsListProps {
  teamId?: string;
  projectId?: string;
}

export function InvitationsList({ teamId, projectId }: InvitationsListProps) {
  const { invitations, users, teams, projects, deleteInvitation } = useAppStore();
  const { toast } = useToast();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Filter invitations based on context
  const filteredInvitations = invitations.filter(inv => {
    if (teamId && projectId) {
      return inv.teamId === teamId && inv.projectId === projectId;
    }
    if (teamId) {
      return inv.teamId === teamId;
    }
    if (projectId) {
      return inv.projectId === projectId;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const copyInvitationLink = async (token: string) => {
    const invitationUrl = `${window.location.origin}/invite/${token}`;
    
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedToken(token);
      toast({
        title: "Link copied",
        description: "Invitation link has been copied to clipboard.",
      });
      
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvitation = (invitationId: string) => {
    if (confirm("Are you sure you want to delete this invitation?")) {
      deleteInvitation(invitationId);
      toast({
        title: "Invitation deleted",
        description: "The invitation has been deleted.",
      });
    }
  };

  const getInvitedByUser = (invitedBy: string) => {
    return users.find(user => user.id === invitedBy);
  };

  const getInvitationContext = (invitation: any) => {
    if (invitation.teamId && invitation.projectId) {
      const team = teams.find(t => t.id === invitation.teamId);
      const project = projects.find(p => p.id === invitation.projectId);
      return `${team?.name} - ${project?.name}`;
    }
    if (invitation.teamId) {
      const team = teams.find(t => t.id === invitation.teamId);
      return team?.name;
    }
    if (invitation.projectId) {
      const project = projects.find(p => p.id === invitation.projectId);
      return project?.name;
    }
    return "General";
  };

  if (filteredInvitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations
          </CardTitle>
          <CardDescription>
            No invitations sent yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invitations have been sent yet.</p>
            <p className="text-sm">Send your first invitation to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invitations ({filteredInvitations.length})
        </CardTitle>
        <CardDescription>
          Manage sent invitations and track their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredInvitations.map((invitation) => {
            const invitedByUser = getInvitedByUser(invitation.invitedBy);
            const isExpired = new Date(invitation.expiresAt) < new Date();
            
            return (
              <div key={invitation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={invitedByUser?.avatar} alt={invitedByUser?.name} />
                      <AvatarFallback>{getInitials(invitation.name || invitation.email)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invitation.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {invitation.role}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invitation.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Invited to: {getInvitationContext(invitation)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sent by: {invitedByUser?.name || 'Unknown'} on {formatDate(invitation.invitedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(invitation.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(invitation.status)}
                        <span className="capitalize">
                          {isExpired && invitation.status === 'pending' ? 'expired' : invitation.status}
                        </span>
                      </div>
                    </Badge>
                    
                    {invitation.status === 'pending' && !isExpired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.token)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {invitation.status === 'pending' && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Expires: {formatDate(invitation.expiresAt)}
                    {isExpired && (
                      <span className="text-red-500 ml-2">(Expired)</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 