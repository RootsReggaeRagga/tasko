import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function DemoLogin() {
  const { setCurrentUser } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginAsDemoUser = () => {
    const { addUser, addTeam, addProject, setCurrentUser } = useAppStore.getState();
    
    // Create a demo user
    const demoUser = {
      name: "Demo User",
      email: "demo@example.com",
      role: "member" as const
    };

    // Add demo user to store and get the generated ID
    addUser(demoUser);
    
    // Get the added user from store to get the generated ID
    const addedUser = useAppStore.getState().users.find(u => u.email === demoUser.email);
    
    if (!addedUser) {
      toast({
        title: "Error",
        description: "Failed to create demo user"
      });
      return;
    }
    
    // Create a demo team
    const demoTeam = {
      name: "Demo Team",
      description: "A demo team for testing",
      members: [addedUser]
    };
    addTeam(demoTeam);
    
    // Get the added team from store
    const addedTeam = useAppStore.getState().teams.find(t => t.name === demoTeam.name);
    
    if (addedTeam) {
      // Create a demo project
      const demoProject = {
        name: "Demo Project",
        description: "A demo project for testing",
        teamId: addedTeam.id
      };
      addProject(demoProject);
    }

    // Set as current user
    setCurrentUser(addedUser);
    
    toast({
      title: "Demo Login",
      description: "You are now logged in as a demo user with demo data"
    });

    navigate("/dashboard");
  };

  return (
    <div className="text-center mt-4">
      <Button variant="outline" onClick={loginAsDemoUser}>
        Log in as Demo User
      </Button>
    </div>
  );
}