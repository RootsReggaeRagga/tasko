import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  List, 
  BarChart4, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Building2,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAppStore();
  const isAdmin = currentUser?.role === 'admin';

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const items = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: FolderOpen,
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Building2,
    },
    {
      name: "Teams",
      href: "/teams",
      icon: Users,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: List,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: TrendingUp,
    },
    ...(isAdmin ? [{
      name: "Users",
      href: "/users",
      icon: UserCheck,
    }] : []),
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background p-2",
      collapsed ? "w-[60px]" : "w-[240px]",
      className
    )}>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "default" : "ghost"}
            size="sm"
            className={cn(
              "justify-start",
              collapsed && "justify-center"
            )}
            onClick={() => navigate(item.href)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {!collapsed && <span>{item.name}</span>}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-auto justify-center"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}