import { LoginForm } from "@/components/auth/login-form";
import { DemoLogin } from "@/components/demo-login";
import { useAppStore } from "@/lib/store";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { currentUser } = useAppStore();
  
  // Redirect if user is already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Team Task Manager</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team's tasks efficiently
          </p>
        </div>
        <LoginForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <DemoLogin />
      </div>
    </div>
  );
}