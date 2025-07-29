import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { ArrowLeft, Users, Mail, FolderOpen } from "lucide-react";
import { EmailInvitationForm } from "@/components/invitations/email-invitation-form";
import { InvitationsList } from "@/components/invitations/invitations-list";
import { ExistingUserInvite } from "@/components/invitations/existing-user-invite";

export default function ProjectInvite() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, teams } = useAppStore();
  
  const project = projects.find((p) => p.id === projectId);
  const team = project ? teams.find((t) => t.id === project.teamId) : null;
  
  if (!project) {
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
          <h3 className="font-medium text-lg mb-2">Project not found</h3>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/projects')}>View All Projects</Button>
        </div>
      </div>
    );
  }

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
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Invite Members to {project.name}</h2>
        <p className="text-muted-foreground">
          Invite new members to your project via email or add existing users
        </p>
        {team && (
          <p className="text-sm text-muted-foreground mt-1">
            Team: {team.name}
          </p>
        )}
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Invitation
          </TabsTrigger>
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Existing Users
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Sent Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-6">
          <EmailInvitationForm 
            teamId={project.teamId}
            projectId={projectId} 
            onSuccess={() => {
              // Optionally refresh or show success message
            }}
          />
        </TabsContent>

        <TabsContent value="existing" className="space-y-6">
          <ExistingUserInvite 
            teamId={project.teamId}
            projectId={projectId}
            onSuccess={() => {
              // Optionally refresh or show success message
            }}
          />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <InvitationsList teamId={project.teamId} projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 