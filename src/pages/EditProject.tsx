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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  description: z.string().optional(),
  teamId: z.string().min(1, { message: "Team is required" }),
  budget: z.number().min(0, { message: "Budget must be positive" }).optional(),
  hourlyRate: z.number().min(0, { message: "Hourly rate must be positive" }).optional(),
  revenue: z.number().min(0, { message: "Revenue must be positive" }).optional(),
});

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { projects, teams, updateProject } = useAppStore();

  const project = projects.find(p => p.id === id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      teamId: "",
      budget: undefined,
      hourlyRate: undefined,
      revenue: undefined,
    },
  });

  // Update form when project data is loaded
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        teamId: project.team_id,
        budget: project.budget,
        hourlyRate: project.hourly_rate,
        revenue: project.revenue,
      });
    }
  }, [project, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Project ID not found",
        variant: "destructive",
      });
      return;
    }

    // Update the project
    await updateProject(id, {
      name: values.name,
      description: values.description || "",
      team_id: values.teamId,
      budget: values.budget,
      hourly_rate: values.hourlyRate,
      revenue: values.revenue,
    });
    
    toast({
      title: "Project updated",
      description: "Your project has been updated successfully.",
    });
    
    navigate('/projects');
  };

  if (!project) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Project</h2>
        </div>
        
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">Project not found</h3>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Project</h2>
        <p className="text-muted-foreground">
          Update your project details.
        </p>
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter project description" 
                      {...field}
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (PLN)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (PLN)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue (PLN)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Project</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 