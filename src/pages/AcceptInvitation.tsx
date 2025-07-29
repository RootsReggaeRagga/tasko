import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { formatDate, getInitials } from "@/lib/utils";
import { Mail, CheckCircle, XCircle, Clock, Users, FolderOpen } from "lucide-react";

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { invitations, users, teams, projects, acceptInvitation, setCurrentUser } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (token) {
      const foundInvitation = invitations.find(inv => inv.token === token);
      if (foundInvitation) {
        setInvitation(foundInvitation);
        setIsExpired(new Date(foundInvitation.expiresAt) < new Date());
      }
    }
  }, [token, invitations]);

  const handleAcceptInvitation = async () => {
    if (!token || !invitation) return;

    setIsLoading(true);

    try {
      // Accept the invitation
      acceptInvitation(token);
      
      // Find the newly created user
      const newUser = users.find(user => user.email === invitation.email);
      
      if (newUser) {
        // Set as current user
        setCurrentUser(newUser);
        
        toast({
          title: "Invitation accepted!",
          description: `Welcome to the team, ${newUser.name}!`,
        });
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInvitedByUser = (invitedBy: string) => {
    return users.find(user => user.id === invitedBy);
  };

  const getInvitationContext = () => {
    if (!invitation) return null;
    
    if (invitation.teamId && invitation.projectId) {
      const team = teams.find(t => t.id === invitation.teamId);
      const project = projects.find(p => p.id === invitation.projectId);
      return { type: 'Team & Project', name: `${team?.name} - ${project?.name}` };
    }
    if (invitation.teamId) {
      const team = teams.find(t => t.id === invitation.teamId);
      return { type: 'Team', name: team?.name };
    }
    if (invitation.projectId) {
      const project = projects.find(p => p.id === invitation.projectId);
      return { type: 'Project', name: project?.name };
    }
    return { type: 'General', name: 'General Access' };
  };

  if (!invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const context = getInvitationContext();
  const invitedByUser = getInvitedByUser(invitation.invitedBy);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={invitedByUser?.avatar} alt={invitedByUser?.name} />
              <AvatarFallback>{getInitials(invitation.name || invitation.email)}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            {invitedByUser?.name} has invited you to join their workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm">{invitation.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{invitation.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role:</span>
              <Badge variant="outline" className="text-xs">
                {invitation.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invited to:</span>
              <div className="flex items-center gap-1">
                {context?.type === 'Team' && <Users className="h-3 w-3" />}
                {context?.type === 'Project' && <FolderOpen className="h-3 w-3" />}
                <span className="text-sm">{context?.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invited by:</span>
              <span className="text-sm">{invitedByUser?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invited on:</span>
              <span className="text-sm">{formatDate(invitation.invitedAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expires:</span>
              <span className="text-sm">{formatDate(invitation.expiresAt)}</span>
            </div>
          </div>

          {isExpired ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Invitation Expired</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This invitation has expired. Please contact the person who sent it for a new invitation.
              </p>
              <Button onClick={() => navigate('/login')} variant="outline">
                Go to Login
              </Button>
            </div>
          ) : invitation.status === 'accepted' ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Already Accepted</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This invitation has already been accepted.
              </p>
              <Button onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Pending Acceptance</span>
              </div>
              <Button 
                onClick={handleAcceptInvitation} 
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="w-full"
              >
                I already have an account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 