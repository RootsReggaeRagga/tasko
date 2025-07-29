// Import the toast function from sonner
import { toast as sonnerToast } from "sonner";

// Type for our toast function
type ToastProps = {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

// Create a wrapper for the sonner toast that handles our custom props
export function useToast() {
  const toast = ({ title, description, variant, action, ...props }: ToastProps) => {
    // Map our variant to sonner's style if needed
    const style = variant === "destructive" ? { style: { backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)" } } : {};
    
    return sonnerToast(title as string, {
      description,
      action,
      ...style,
      ...props
    });
  };
  
  return {
    toast,
    // Expose the original sonner toast for direct usage if needed
    sonnerToast
  };
}