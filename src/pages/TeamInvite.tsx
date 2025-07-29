import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  userId: z.string().min(1, { message: "Please select a user to invite" }),
});

export default function TeamInvite() {
  const navigate = useNavigate();
  const { id: teamId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { teams, users, addMemberToTeam } = useAppStore();
  
  const team = teams.find((t) => t.id === teamId);
  
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

  // Get users who are not already members of this team
  const availableUsers = users.filter(user => 
    !team.members.some(member => member.id === user.id)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addMemberToTeam(teamId!, values.userId);
    
    toast({
      title: "Member invited",
      description: "The user has been added to the team successfully.",
    });
    
    navigate(`/teams/${teamId}`);
  };

  if (availableUsers.length === 0) {
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
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invite Member to {team.name}</h2>
          <p className="text-muted-foreground">
            Add new members to your team.
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">No users available</h3>
          <p className="text-muted-foreground mb-4">
            All users are already members of this team or there are no other users in the system.
          </p>
          <Button onClick={() => navigate(`/teams/${teamId}`)}>Back to Team</Button>
        </div>
      </div>
    );
  }

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
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Invite Member to {team.name}</h2>
        <p className="text-muted-foreground">
          Add new members to your team.
        </p>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user to invite" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Invite Member
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 