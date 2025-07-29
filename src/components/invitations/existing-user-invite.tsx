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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus } from "lucide-react";

const formSchema = z.object({
  userId: z.string().min(1, { message: "Please select a user to invite" }),
});

interface ExistingUserInviteProps {
  teamId?: string;
  projectId?: string;
  onSuccess?: () => void;
}

export function ExistingUserInvite({ teamId, projectId, onSuccess }: ExistingUserInviteProps) {
  const { toast } = useToast();
  const { teams, users, addMemberToTeam } = useAppStore();
  
  const team = teams.find((t) => t.id === teamId);
  
  // Get users who are not already members of this team
  const availableUsers = team 
    ? users.filter(user => !team.members.some(member => member.id === user.id))
    : users;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (teamId) {
      addMemberToTeam(teamId, values.userId);
    }
    
    toast({
      title: "Member added",
      description: "The user has been added successfully.",
    });
    
    form.reset();
    onSuccess?.();
  };

  if (availableUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Existing User
          </CardTitle>
          <CardDescription>
            No available users to invite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>All users are already members of this team.</p>
            <p className="text-sm">Try sending an email invitation instead.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invite Existing User
        </CardTitle>
        <CardDescription>
          Add an existing user to your team
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                          <div className="flex items-center gap-2">
                            <span>{user.name}</span>
                            <span className="text-muted-foreground">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full gap-2"
              disabled={!form.watch('userId')}
            >
              <UserPlus className="h-4 w-4" />
              Add to Team
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 