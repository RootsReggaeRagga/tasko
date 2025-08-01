import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import { formatDate, getInitials, getStatusColor, getPriorityColor, cn, formatDuration } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function TaskList() {
  const navigate = useNavigate();
  const { tasks, users, projects, updateTask, deleteTask } = useAppStore();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Filter tasks based on user selections
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesProject && matchesSearch;
  });

  // Sort tasks by creation date (newest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <Button className="gap-1" onClick={() => navigate('/new-task')}>
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="testing">Testing</SelectItem>
            <SelectItem value="reopen">Reopen</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="hidden md:table-cell">Due Date</TableHead>
              <TableHead className="hidden md:table-cell">Assignee</TableHead>
              <TableHead className="hidden lg:table-cell">Total Time</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              sortedTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId);
                const project = projects.find((p) => p.id === task.projectId);
                
                return (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">{project?.name}</div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.status}
                        onValueChange={(value) => {
                          handleStatusChange(task.id, value as Task['status']);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue>
                            <Badge className={cn("font-normal", getStatusColor(task.status))}>
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="reopen">Reopen</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={assignee.avatar} alt={assignee.name} />
                            <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignee.name}</span>
                        </div>
                      ) : (
                        "Unassigned"
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {(() => {
                        // Calculate total time from timeTracking history
                        const totalTimeFromHistory = task.timeTracking?.reduce((total, record) => {
                          return total + (record.duration || 0);
                        }, 0) || 0;
                        
                        const hasTimeTracked = totalTimeFromHistory > 0 || (task.timeSpent !== undefined && task.timeSpent > 0);
                        
                        return hasTimeTracked ? (
                          <div className="text-sm text-muted-foreground">
                            ⏱️ {formatDuration(totalTimeFromHistory)}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground bg-yellow-100 p-1 rounded">
                            No time tracked
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tasks/${task.id}/edit`);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}