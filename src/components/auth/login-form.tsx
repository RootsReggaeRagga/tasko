import { useState } from "react";
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
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase, refreshSupabaseData, syncUserData, checkDatabaseStructure, syncCurrentUserToProfiles, getCurrentUserFromProfiles, checkTablePermissions } from "@/lib/supabase";
import { generateId } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentUser, addUser, users } = useAppStore();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Check database structure first
      await checkDatabaseStructure();
      
      // Check table permissions
      await checkTablePermissions();
      
      // Refresh Supabase data to ensure fresh connection
      await refreshSupabaseData();

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      if (data && data.user) {
        // Try to get existing user from profiles table first
        let user = await getCurrentUserFromProfiles(data.user.id);
        
        if (!user) {
          // User doesn't exist in profiles, create new user object
          user = {
            id: data.user.id,
            email: data.user.email || "",
            name: data.user.email?.split('@')[0] || "User",
            role: 'admin', // Domyślnie admin dla nowych użytkowników
            theme: 'system' as const,
            hourlyRate: 50, // Domyślna stawka godzinowa
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Sync new user to profiles table
          await syncCurrentUserToProfiles(user);
          
          // Create a default team for new user
          const { addTeam } = useAppStore.getState();
          const teamId = generateId();
          const defaultTeam = {
            name: `${user.name}'s Team`,
            description: `Default team for ${user.name}`,
            members: [user]
          };
          addTeam(defaultTeam);
          
          // Update user with team ID
          user.teamId = teamId;
          await syncCurrentUserToProfiles(user);
        }

        // Debug: sprawdź user object
        console.log('Login - user object:', user);
        console.log('Login - user ID:', user.id);
        console.log('Login - user teamId:', user.teamId);

        // Check if user already exists in store
        const existingUser = users.find(u => u.id === user.id);
        
        if (!existingUser) {
          // Add user to store if not exists
          const { users } = useAppStore.getState();
          useAppStore.setState({
            users: [...users, user]
          });
        } else {
          // Update existing user with fresh data
          const { users } = useAppStore.getState();
          useAppStore.setState({
            users: users.map(u => u.id === user.id ? user : u)
          });
        }

        // Set current user in app state
        setCurrentUser(user);
        
        // Load data from Supabase
        const { loadDataFromSupabase } = useAppStore.getState();
        await loadDataFromSupabase();
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Invalid email or password. Please try again.");
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your email below to login to your account
        </p>
      </div>
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="hello@example.com" 
                    disabled={isLoading} 
                    autoComplete="email"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      autoComplete="current-password"
                      {...field} 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        <p className="text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="underline underline-offset-4 hover:text-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}