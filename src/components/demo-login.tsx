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
    const { addUser, addTeam, addProject, addClient, setCurrentUser } = useAppStore.getState();
    
    // Create demo users
    const demoUsers = [
      {
        name: "Demo User",
        email: "demo@example.com",
        role: "member" as const,
        theme: "system" as const
      },
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "member" as const,
        theme: "light" as const
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        role: "member" as const,
        theme: "dark" as const
      },
      {
        name: "Carol Davis",
        email: "carol@example.com",
        role: "admin" as const,
        theme: "system" as const
      }
    ];

    // Add all demo users to store
    demoUsers.forEach(user => addUser(user));
    
    // Get the main demo user from store to get the generated ID
    const addedUser = useAppStore.getState().users.find(u => u.email === "demo@example.com");
    
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
      // Create demo clients
      const demoClients = [
        {
          name: "John Smith",
          email: "john.smith@acme.com",
          phone: "+1 (555) 123-4567",
          company: "Acme Corporation",
          status: "active" as const
        },
        {
          name: "Sarah Johnson",
          email: "sarah.johnson@techstart.com",
          phone: "+1 (555) 987-6543",
          company: "TechStart Inc",
          status: "active" as const
        },
        {
          name: "Mike Wilson",
          email: "mike.wilson@globalsoft.com",
          company: "GlobalSoft Solutions",
          status: "inactive" as const
        }
      ];

      // Add demo clients
      demoClients.forEach(client => addClient(client));

      // Create demo projects with client associations
      const demoProjects = [
        // Acme Corporation - multiple projects
        {
          name: "Website Redesign",
          description: "Complete redesign of the company website with modern UI/UX",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "Acme Corporation")?.id,
          category: "web-development" as const
        },
        {
          name: "Mobile App Development",
          description: "iOS and Android app for customer management and sales tracking",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "Acme Corporation")?.id,
          category: "mobile-app" as const
        },
        {
          name: "Digital Marketing Campaign",
          description: "Google Ads and social media advertising campaign",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "Acme Corporation")?.id,
          category: "marketing" as const
        },
        {
          name: "SEO Optimization",
          description: "Search engine optimization for better online visibility",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "Acme Corporation")?.id,
          category: "seo" as const
        },
        
        // TechStart Inc - multiple projects
        {
          name: "E-commerce Platform",
          description: "Online store with payment integration and inventory management",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "TechStart Inc")?.id,
          category: "ecommerce" as const
        },
        {
          name: "Brand Identity Design",
          description: "Logo design, brand guidelines, and marketing materials",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "TechStart Inc")?.id,
          category: "design" as const
        },
        {
          name: "Content Marketing Strategy",
          description: "Blog content, social media posts, and email campaigns",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "TechStart Inc")?.id,
          category: "marketing" as const
        }
      ];

      // Add demo projects
      demoProjects.forEach(project => addProject(project));
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