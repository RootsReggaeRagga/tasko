import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { formatDate, formatDuration, formatCurrency, calculateProjectCosts } from "@/lib/utils";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Users, 
  FolderOpen, 
  Building2,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  Play,
  DollarSign,
  TrendingDown
} from "lucide-react";

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export default function Reports() {
  const { tasks, projects, teams, clients, users } = useAppStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== 'done';
  }).length;

  // Time tracking statistics
  const totalTimeSpent = tasks.reduce((total, task) => {
    const timeFromHistory = task.timeTracking?.reduce((sum, record) => sum + (record.duration || 0), 0) || 0;
    return total + Math.max(timeFromHistory, task.timeSpent || 0);
  }, 0);

  const averageTimePerTask = totalTasks > 0 ? totalTimeSpent / totalTasks : 0;

  // Project statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => {
    const projectTasks = tasks.filter(t => t.projectId === p.id);
    return projectTasks.some(t => t.status !== 'done');
  }).length;

  // Team statistics
  const totalTeamMembers = teams.reduce((total, team) => total + team.members.length, 0);

  // Client statistics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;

  // Financial statistics
  const totalCosts = tasks.reduce((total, task) => total + (task.cost || 0), 0);
  const totalRevenue = projects.reduce((total, project) => total + (project.revenue || 0), 0);
  const totalProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Project financial analysis
  const projectFinancials = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const { totalCost, totalTime, averageHourlyRate } = calculateProjectCosts(projectTasks, project.hourlyRate);
    const projectRevenue = project.revenue || 0;
    const projectProfit = projectRevenue - totalCost;
    
    return {
      ...project,
      totalCost,
      totalTime,
      averageHourlyRate,
      revenue: projectRevenue,
      profit: projectProfit,
      profitMargin: projectRevenue > 0 ? (projectProfit / projectRevenue) * 100 : 0
    };
  });

  const topProfitableProjects = projectFinancials
    .filter(p => p.revenue > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Task status distribution
  const taskStatusDistribution = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    testing: tasks.filter(t => t.status === 'testing').length,
    done: tasks.filter(t => t.status === 'done').length,
    reopen: tasks.filter(t => t.status === 'reopen').length
  };

  // Priority distribution
  const priorityDistribution = {
    low: tasks.filter(t => t.priority === 'low').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    high: tasks.filter(t => t.priority === 'high').length
  };

  // Top projects by task count
  const topProjects = projects
    .map(project => ({
      ...project,
      taskCount: tasks.filter(t => t.projectId === project.id).length,
      completedCount: tasks.filter(t => t.projectId === project.id && t.status === 'done').length
    }))
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5);

  // Top time trackers
  const userTimeTracking = users.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const totalTime = userTasks.reduce((total, task) => {
      const timeFromHistory = task.timeTracking?.reduce((sum, record) => sum + (record.duration || 0), 0) || 0;
      return total + Math.max(timeFromHistory, task.timeSpent || 0);
    }, 0);
    
    return {
      user,
      totalTime,
      taskCount: userTasks.length,
      completedTasks: userTasks.filter(t => t.status === 'done').length
    };
  }).sort((a, b) => b.totalTime - a.totalTime).slice(0, 5);

  // Recent activity (last 7 days)
  const recentTasks = tasks
    .filter(task => {
      const taskDate = new Date(task.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      testing: 'bg-purple-100 text-purple-800',
      done: 'bg-green-100 text-green-800',
      reopen: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your projects, tasks, and team performance
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatDuration(averageTimePerTask)} per task
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              of {totalProjects} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeamMembers}</div>
            <p className="text-xs text-muted-foreground">
              across {teams.length} teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              from {projects.filter(p => p.revenue && p.revenue > 0).length} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCosts)}</div>
            <p className="text-xs text-muted-foreground">
              {formatDuration(totalTimeSpent)} of work
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(taskStatusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                        <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Task Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(priorityDistribution).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority).split(' ')[0]}`} />
                        <span className="text-sm capitalize">{priority}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overdue Tasks</span>
                    <Badge variant="destructive">{overdueTasks}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <Badge variant="secondary">{inProgressTasks}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Clients</span>
                    <Badge variant="outline">{activeClients}/{totalClients}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Time Trackers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Time Trackers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userTimeTracking.map((item, index) => (
                    <div key={item.user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span className="text-sm">{item.user.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatDuration(item.totalTime)}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.completedTasks}/{item.taskCount} tasks
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(task.createdAt)}
                        </div>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Projects by Task Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProjects.map((project, index) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <div>
                        <div className="text-sm font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.category ? project.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'No category'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{project.taskCount} tasks</div>
                      <div className="text-xs text-muted-foreground">
                        {project.completedCount} completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Most Profitable Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Most Profitable Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProfitableProjects.map((project, index) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <div>
                          <div className="text-sm font-medium">{project.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(project.revenue)} revenue
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${project.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(project.profit)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.profitMargin.toFixed(1)}% margin
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Project Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectFinancials.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDuration(project.totalTime)} work
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(project.totalCost)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(project.averageHourlyRate)}/h avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCosts)}</div>
                  <div className="text-sm text-muted-foreground">Total Costs</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalProfit)}
                  </div>
                  <div className="text-sm text-muted-foreground">Net Profit</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-medium">{profitMargin.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teams.map((team) => {
                  const teamTasks = tasks.filter(t => {
                    const project = projects.find(p => p.id === t.projectId);
                    return project?.team_id === team.id;
                  });
                  const completedTasks = teamTasks.filter(t => t.status === 'done').length;
                  
                  return (
                    <div key={team.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{team.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {team.members.length} members
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{teamTasks.length} tasks</div>
                        <div className="text-xs text-muted-foreground">
                          {completedTasks} completed
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Client Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients.map((client) => {
                  const clientProjects = projects.filter(p => p.clientId === client.id);
                  const clientTasks = tasks.filter(t => {
                    const project = projects.find(p => p.id === t.projectId);
                    return project?.clientId === client.id;
                  });
                  const completedTasks = clientTasks.filter(t => t.status === 'done').length;
                  
                  return (
                    <div key={client.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{client.company}</div>
                        <div className="text-xs text-muted-foreground">
                          {clientProjects.length} projects
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{clientTasks.length} tasks</div>
                        <div className="text-xs text-muted-foreground">
                          {completedTasks} completed
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 