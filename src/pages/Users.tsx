import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  UserPlus,
  Crown,
  Users as UsersIcon,
  Clock,
  DollarSign
} from "lucide-react";
import { formatDate, getInitials, formatCurrency } from "@/lib/utils";

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'member';
  hourlyRate?: number;
}

export default function Users() {
  const { toast } = useToast();
  const { users, tasks, teams, addUser, updateUser, deleteUser, setUserRole, setUserHourlyRate, currentUser } = useAppStore();

  // Debug: sprawdź currentUser
  console.log('Users page - currentUser:', currentUser);
  console.log('Users page - currentUser?.role:', currentUser?.role);
  console.log('Users page - isAdmin check:', currentUser?.role === 'admin');

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground mb-4">
            Only administrators can manage users.
          </p>
        </div>
      </div>
    );
  }
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "member",
    hourlyRate: undefined,
  });

  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required.",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      // Update existing user
      const userToUpdate = users.find(u => u.email === editingUser.email);
      if (userToUpdate) {
        updateUser(userToUpdate.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          hourlyRate: formData.hourlyRate,
        });
        toast({
          title: "User updated",
          description: "User has been updated successfully.",
        });
      }
    } else {
      // Add new user
      addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        hourlyRate: formData.hourlyRate,
        theme: 'system',
      });
      toast({
        title: "User added",
        description: "New user has been added successfully.",
      });
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      role: "member",
      hourlyRate: undefined,
    });
    setEditingUser(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (user: any) => {
    setEditingUser({
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate,
    });
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account.",
        variant: "destructive"
      });
      return;
    }

    const userTasks = tasks.filter(task => task.assigneeId === userId);
    if (userTasks.length > 0) {
      toast({
        title: "Error",
        description: `Cannot delete user with ${userTasks.length} assigned tasks.`,
        variant: "destructive"
      });
      return;
    }

    const userTeams = teams.filter(team => 
      team.members.some(member => member.id === userId)
    );
    if (userTeams.length > 0) {
      toast({
        title: "Error",
        description: `Cannot delete user who is a member of ${userTeams.length} teams.`,
        variant: "destructive"
      });
      return;
    }

    deleteUser(userId);
    toast({
      title: "User deleted",
      description: `${userName} has been deleted successfully.`,
    });
  };

  const handleRoleChange = (userId: string, newRole: 'admin' | 'member') => {
    setUserRole(userId, newRole);
    toast({
      title: "Role updated",
      description: `User role has been changed to ${newRole}.`,
    });
  };

  const handleHourlyRateChange = (userId: string, hourlyRate: number) => {
    setUserHourlyRate(userId, hourlyRate);
    toast({
      title: "Hourly rate updated",
      description: `Hourly rate has been updated to ${formatCurrency(hourlyRate)}/h.`,
    });
  };

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assigneeId === userId);
    const completedTasks = userTasks.filter(task => task.status === 'done').length;
    const totalTimeSpent = userTasks.reduce((total, task) => {
      const timeFromHistory = task.timeTracking?.reduce((sum, record) => sum + (record.duration || 0), 0) || 0;
      return total + Math.max(timeFromHistory, task.timeSpent || 0);
    }, 0);
    const totalCost = userTasks.reduce((total, task) => total + (task.cost || 0), 0);

    return {
      totalTasks: userTasks.length,
      completedTasks,
      totalTimeSpent,
      totalCost,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage users and their permissions</p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 gap-1">
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? "Update user information and permissions."
                    : "Add a new user to the system."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter user name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter user email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'member') => 
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (PLN)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      hourlyRate: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    placeholder="50"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingUser(null);
                      setFormData({
                        name: "",
                        email: "",
                        role: "member",
                        hourlyRate: undefined,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? "Update User" : "Add User"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h3 className="font-medium text-lg mb-2">No users yet</h3>
          <p className="text-muted-foreground mb-4">
            Add users to start managing your team.
          </p>
          {isAdmin && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add First User
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const stats = getUserStats(user.id);
            const isCurrentUser = user.id === currentUser?.id;
            
            return (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {user.name}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id, user.name)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <UsersIcon className="h-4 w-4 text-blue-500" />
                      )}
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                    {isAdmin && !isCurrentUser && (
                      <Select
                        value={user.role}
                        onValueChange={(value: 'admin' | 'member') => 
                          handleRoleChange(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {user.hourlyRate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(user.hourlyRate)}/h
                        </span>
                        {isAdmin && !isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRate = prompt(
                                "Enter new hourly rate (PLN):",
                                user.hourlyRate?.toString()
                              );
                              if (newRate && !isNaN(parseFloat(newRate))) {
                                handleHourlyRateChange(user.id, parseFloat(newRate));
                              }
                            }}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold">{stats.totalTasks}</div>
                      <div className="text-xs text-muted-foreground">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{stats.completedTasks}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>

                  {stats.totalTimeSpent > 0 && (
                    <div className="text-center pt-2 border-t">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {Math.round(stats.totalTimeSpent / 60)}h total
                        </span>
                      </div>
                      {stats.totalCost > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(stats.totalCost)} earned
                        </div>
                      )}
                    </div>
                  )}

                  {user.createdAt && (
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 