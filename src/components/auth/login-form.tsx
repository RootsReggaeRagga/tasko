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
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Initialize Supabase client
const supabaseUrl = 'https://wjefekwnlznwgnxxahxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZWZla3dubHpud2dueHhhaHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjExOTUsImV4cCI6MjA2OTAzNzE5NX0.a0gmfaPlyrPN-V3ldgn7WMFoNZ-PFEsTN_ssygFHnp8';
const supabase = createClient(supabaseUrl, supabaseKey);

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
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      if (data && data.user) {
        // Get user profile data if needed
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Create user object from authentication data
        const user = {
          id: data.user.id,
          email: data.user.email || "",
          name: userData?.name || data.user.email?.split('@')[0] || "User",
          role: userData?.role || 'admin', // Domyślnie admin dla nowych użytkowników
          theme: 'system' as const,
          hourlyRate: 50, // Domyślna stawka godzinowa
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Debug: sprawdź user object
        console.log('Login - created user object:', user);
        console.log('Login - userData from Supabase:', userData);

        // Check if user already exists in store
        const existingUser = users.find(u => u.id === user.id);
        
        if (!existingUser) {
          // Add user to store if not exists, but preserve the Supabase ID
          const { users } = useAppStore.getState();
          useAppStore.setState({
            users: [...users, user]
          });
        }

        // Set current user in app state
        setCurrentUser(user);
        
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