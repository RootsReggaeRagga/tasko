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
    const { addUser, addTeam, addProject, addClient, addTask, setCurrentUser } = useAppStore.getState();
    
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
          category: "web-development" as const,
          budget: 15000,
          hourlyRate: 60,
          revenue: 20000
        },
        {
          name: "Mobile App Development",
          description: "iOS and Android app for customer management and sales tracking",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "Acme Corporation")?.id,
          category: "mobile-app" as const,
          budget: 25000,
          hourlyRate: 75,
          revenue: 35000
        },
        {
          name: "Digital Marketing Campaign",
          description: "Google Ads and social media advertising campaign",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "Acme Corporation")?.id,
          category: "marketing" as const,
          budget: 8000,
          hourlyRate: 45,
          revenue: 12000
        },
        {
          name: "SEO Optimization",
          description: "Search engine optimization for better online visibility",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "Acme Corporation")?.id,
          category: "seo" as const,
          budget: 5000,
          hourlyRate: 40,
          revenue: 8000
        },
        
        // TechStart Inc - multiple projects
        {
          name: "E-commerce Platform",
          description: "Online store with payment integration and inventory management",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "TechStart Inc")?.id,
          category: "ecommerce" as const,
          budget: 30000,
          hourlyRate: 80,
          revenue: 45000
        },
        {
          name: "Brand Identity Design",
          description: "Logo design, brand guidelines, and marketing materials",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "TechStart Inc")?.id,
          category: "design" as const,
          budget: 6000,
          hourlyRate: 55,
          revenue: 9000
        },
        {
          name: "Content Marketing Strategy",
          description: "Blog content, social media posts, and email campaigns",
          teamId: addedTeam.id,
          clientId: useAppStore.getState().clients.find(c => c.company === "TechStart Inc")?.id,
          category: "marketing" as const,
          budget: 4000,
          hourlyRate: 35,
          revenue: 7000
        }
      ];

      // Add demo projects
      demoProjects.forEach(project => addProject(project));

      // Add demo tasks with financial data
      const demoTasks = [
        {
          title: "Design Homepage Layout",
          description: "Create wireframes and mockups for the new homepage",
          status: "done" as const,
          priority: "high" as const,
          projectId: useAppStore.getState().projects.find(p => p.name === "Website Redesign")?.id || "",
          assigneeId: addedUser.id,
          createdById: addedUser.id,
          timeSpent: 240, // 4 hours
          hourlyRate: 60,
          tags: ["design", "frontend"]
        },
        {
          title: "Implement Responsive Design",
          description: "Make the website responsive for mobile devices",
          status: "in-progress" as const,
          priority: "medium" as const,
          projectId: useAppStore.getState().projects.find(p => p.name === "Website Redesign")?.id || "",
          assigneeId: addedUser.id,
          createdById: addedUser.id,
          timeSpent: 180, // 3 hours
          hourlyRate: 60,
          tags: ["frontend", "responsive"]
        },
        {
          title: "Database Schema Design",
          description: "Design the database structure for the mobile app",
          status: "done" as const,
          priority: "high" as const,
          projectId: useAppStore.getState().projects.find(p => p.name === "Mobile App Development")?.id || "",
          assigneeId: addedUser.id,
          createdById: addedUser.id,
          timeSpent: 300, // 5 hours
          hourlyRate: 75,
          tags: ["backend", "database"]
        },
        {
          title: "Google Ads Setup",
          description: "Configure Google Ads campaign for the marketing project",
          status: "testing" as const,
          priority: "medium" as const,
          projectId: useAppStore.getState().projects.find(p => p.name === "Digital Marketing Campaign")?.id || "",
          assigneeId: addedUser.id,
          createdById: addedUser.id,
          timeSpent: 120, // 2 hours
          hourlyRate: 45,
          tags: ["marketing", "ads"]
        }
      ];

      // Add demo tasks
      demoTasks.forEach(task => addTask(task));
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