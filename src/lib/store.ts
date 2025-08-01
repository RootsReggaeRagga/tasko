import { create } from 'zustand';
import { User, Task, Team, Project, Client, Invitation } from '@/types';
import { generateId, calculateTaskCost } from '@/lib/utils';
import { supabase } from './supabase';

interface State {
  users: User[];
  tasks: Task[];
  teams: Team[];
  projects: Project[];
  clients: Client[];
  invitations: Invitation[];
  currentUser: User | null;
  currentTeam: Team | null;
  isLoading: boolean;
}

interface Actions {
  // User actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  setUserRole: (id: string, role: 'admin' | 'member') => void;
  setUserHourlyRate: (id: string, hourlyRate: number) => void;
  
  // Team actions
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  setCurrentTeam: (team: Team | null) => void;
  addMemberToTeam: (teamId: string, userId: string) => void;
  removeMemberFromTeam: (teamId: string, userId: string) => void;
  
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Data loading actions
  loadDataFromSupabase: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  
  // Theme actions
  setUserTheme: (userId: string, theme: 'light' | 'dark' | 'system') => void;
  
  // Invitation actions
  createInvitation: (invitation: Omit<Invitation, 'id' | 'invitedAt' | 'expiresAt' | 'token'>) => void;
  updateInvitation: (id: string, invitation: Partial<Invitation>) => void;
  deleteInvitation: (id: string) => void;
  acceptInvitation: (token: string) => void;
}

export const useAppStore = create<State & Actions>((set, get) => ({
  users: [],
  tasks: [],
  teams: [],
  projects: [],
  clients: [],
  invitations: [],
  currentUser: null,
  currentTeam: null,
  isLoading: false,

  // Loading actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  loadDataFromSupabase: async () => {
    const { setLoading } = get();
    setLoading(true);
    
    try {
      const currentUser = get().currentUser;
      if (!currentUser) {
        console.log('No current user, skipping data load');
        return;
      }

      console.log('Loading data from Supabase for user:', currentUser.id);

      // Load tasks for current user
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .or(`assignee_id.eq.${currentUser.id},created_by_id.eq.${currentUser.id}`);

      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
      } else {
        console.log('Loaded tasks from Supabase:', tasksData?.length || 0);
        // Map Supabase data to Task interface
        const tasks = tasksData?.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assignee_id,
          createdById: task.created_by_id,
          projectId: task.project_id,
          timeEstimate: task.time_estimate,
          timeSpent: task.time_spent,
          timeStarted: task.time_started,
          hourlyRate: task.hourly_rate,
          cost: task.cost,
          dueDate: task.due_date,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          tags: task.tags
        })) || [];
        
        set({ tasks });
      }

      // Load projects for current user's team
      if (currentUser.teamId) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('team_id', currentUser.teamId);

        if (projectsError) {
          console.error('Error loading projects:', projectsError);
        } else {
          console.log('Loaded projects from Supabase:', projectsData?.length || 0);
          // Map Supabase data to Project interface
          const projects = projectsData?.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            clientId: project.client_id,
            teamId: project.team_id,
            category: project.category,
            budget: project.budget,
            hourlyRate: project.hourly_rate,
            revenue: project.revenue,
            createdAt: project.created_at,
            tasks: [] // We'll populate this separately
          })) || [];
          
          set({ projects });
        }
      }

      // Load clients for current user's team
      if (currentUser.teamId) {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('team_id', currentUser.teamId);

        if (clientsError) {
          console.error('Error loading clients:', clientsError);
        } else {
          console.log('Loaded clients from Supabase:', clientsData?.length || 0);
          // Map Supabase data to Client interface
          const clients = clientsData?.map(client => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            avatar: client.avatar,
            status: client.status,
            createdBy: client.created_by,
            teamId: client.team_id,
            createdAt: client.created_at
          })) || [];
          
          set({ clients });
        }
      }

    } catch (error) {
      console.error('Error in loadDataFromSupabase:', error);
    } finally {
      setLoading(false);
    }
  },

  // User actions
  addUser: (user) => 
    set((state) => ({
      users: [...state.users, { 
        ...user, 
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    })),
  updateUser: (id, user) =>
    set((state) => ({
      users: state.users.map((u) => 
        u.id === id 
          ? { ...u, ...user, updatedAt: new Date().toISOString() } 
          : u
      )
    })),
  deleteUser: (id) =>
    set((state) => {
      // Check if user is current user
      if (state.currentUser?.id === id) {
        console.warn("Cannot delete current user");
        return state;
      }

      // Check if user has assigned tasks
      const hasAssignedTasks = state.tasks.some(task => task.assigneeId === id);
      if (hasAssignedTasks) {
        console.warn("Cannot delete user with assigned tasks");
        return state;
      }

      // Check if user is in any teams
      const isInTeams = state.teams.some(team => 
        team.members.some(member => member.id === id)
      );
      if (isInTeams) {
        console.warn("Cannot delete user who is a team member");
        return state;
      }

      return {
        users: state.users.filter((u) => u.id !== id)
      };
    }),
  setCurrentUser: (user) =>
    set(() => ({
      currentUser: user
    })),
  setUserRole: (id, role) =>
    set((state) => ({
      users: state.users.map((user) => 
        user.id === id 
          ? { ...user, role, updatedAt: new Date().toISOString() } 
          : user
      )
    })),
  setUserHourlyRate: (id, hourlyRate) =>
    set((state) => ({
      users: state.users.map((user) => 
        user.id === id 
          ? { ...user, hourlyRate, updatedAt: new Date().toISOString() } 
          : user
      )
    })),

  // Team actions
  addTeam: (team) => 
    set((state) => ({
      teams: [...state.teams, { 
        ...team, 
        id: generateId(), 
        createdAt: new Date().toISOString() 
      }]
    })),
  updateTeam: (id, team) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...team } : t))
    })),
  deleteTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id)
    })),
  setCurrentTeam: (team) =>
    set(() => ({
      currentTeam: team
    })),
  addMemberToTeam: (teamId, userId) =>
    set((state) => {
      const user = state.users.find(u => u.id === userId);
      if (!user) {
        console.error(`User with id ${userId} not found`);
        return state;
      }
      
      return {
        teams: state.teams.map((team) => 
          team.id === teamId 
            ? { 
                ...team, 
                members: [...team.members, user]
              } 
            : team
        )
      };
    }),
  removeMemberFromTeam: (teamId, userId) =>
    set((state) => ({
      teams: state.teams.map((team) => 
        team.id === teamId 
          ? { 
              ...team, 
              members: team.members.filter(member => member.id !== userId)
            } 
          : team
      )
    })),

  // Project actions
  addProject: async (project) => {
    console.log('addProject called with:', project);
    const currentUser = useAppStore.getState().currentUser;
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('No current user found! Cannot add project.');
      return;
    }
    
    if (!currentUser.id) {
      console.error('Current user has no ID! Cannot add project.');
      return;
    }
    
    // Check if user is authenticated in Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No Supabase session found! User not authenticated.');
      return;
    }
    
    console.log('Supabase session found:', session.user.id);
    
    const newProject = { 
      ...project, 
      id: generateId(), 
      createdAt: new Date().toISOString(),
      tasks: [] // Initialize with an empty array of task IDs
    };
    
    console.log('New project object:', newProject);
    
    // Add to local store immediately
    set((state) => ({
      projects: [...state.projects, newProject]
    }));
    
    // Sync to Supabase
    try {
      const supabaseData = {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        client_id: newProject.clientId,
        team_id: newProject.teamId,
        category: newProject.category,
        budget: newProject.budget,
        hourly_rate: newProject.hourlyRate,
        revenue: newProject.revenue,
        created_at: newProject.createdAt
      };
      
      console.log('Sending to Supabase:', supabaseData);
      
      const { error } = await supabase
        .from('projects')
        .insert(supabaseData);
      
      if (error) {
        console.error('Error syncing project to Supabase:', error);
      } else {
        console.log('Project synced to Supabase successfully');
      }
    } catch (error) {
      console.error('Error in addProject:', error);
    }
  },
  updateProject: (id, project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...project } : p))
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => !state.projects.find(p => p.id === id)?.tasks.includes(t.id))
    })),

  // Task actions
  addTask: async (task) => {
    console.log('=== ADD TASK DEBUG ===');
    console.log('addTask called with:', task);
    const currentUser = useAppStore.getState().currentUser;
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('No current user found! Cannot add task.');
      return;
    }
    
    if (!currentUser.id) {
      console.error('Current user has no ID! Cannot add task.');
      return;
    }
    
    // Check if user is authenticated in Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No Supabase session found! User not authenticated.');
      return;
    }
    
    console.log('Supabase session found:', session.user.id);
    
    // Check if currentUser.id matches Supabase auth user
    if (session.user.id !== currentUser.id) {
      console.error('Current user ID mismatch! Local:', currentUser.id, 'Supabase:', session.user.id);
      return;
    }
    
    const newTask = { 
      ...task, 
      id: generateId(), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cost: task.hourlyRate && task.timeSpent ? calculateTaskCost(task.timeSpent, task.hourlyRate) : 0
    };
    
    console.log('New task object:', newTask);
    
    // Add to local store immediately
    set((state) => ({
      tasks: [...state.tasks, newTask],
      projects: state.projects.map(project => 
        project.id === task.projectId 
          ? { ...project, tasks: [...(project.tasks || []), newTask.id] }
          : project
      )
    }));
    
    // Sync to Supabase
    try {
      const supabaseData = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        assignee_id: newTask.assigneeId,
        created_by_id: newTask.createdById,
        project_id: newTask.projectId,
        time_estimate: newTask.timeEstimate,
        time_spent: newTask.timeSpent,
        time_started: newTask.timeStarted,
        hourly_rate: newTask.hourlyRate,
        cost: newTask.cost,
        due_date: newTask.dueDate,
        created_at: newTask.createdAt,
        updated_at: newTask.updatedAt,
        tags: newTask.tags
      };
      
      console.log('Sending to Supabase:', supabaseData);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(supabaseData)
        .select();
      
      if (error) {
        console.error('Error syncing task to Supabase:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('Task synced to Supabase successfully');
        console.log('Returned data:', data);
      }
    } catch (error) {
      console.error('Error in addTask:', error);
    }
    console.log('=== END ADD TASK DEBUG ===');
  },
  updateTask: (id, task) => {
    console.log("updateTask called:", { id, task });
    set((state) => {
      const updatedTasks = state.tasks.map((t) => {
        if (t.id === id) {
          const updatedTask = { ...t, ...task, updatedAt: new Date().toISOString() };
          // Recalculate cost if timeSpent or hourlyRate changed
          if (task.timeSpent !== undefined || task.hourlyRate !== undefined) {
            const newTimeSpent = task.timeSpent !== undefined ? task.timeSpent : t.timeSpent;
            const newHourlyRate = task.hourlyRate !== undefined ? task.hourlyRate : t.hourlyRate;
            updatedTask.cost = newHourlyRate && newTimeSpent ? calculateTaskCost(newTimeSpent, newHourlyRate) : 0;
          }
          return updatedTask;
        }
        return t;
      });
      
      const updatedTask = updatedTasks.find(t => t.id === id);
      console.log("Updated task:", updatedTask);
      
      return {
        tasks: updatedTasks,
        // Only keep task IDs in the projects array
        projects: state.projects.map(project => ({
          ...project,
          tasks: Array.isArray(project.tasks) ? project.tasks : []
        }))
      };
    });
  },
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      projects: state.projects.map(project => ({
        ...project,
        tasks: Array.isArray(project.tasks) 
          ? project.tasks.filter(taskId => taskId !== id)
          : []
      }))
    })),

  // Client actions
  addClient: async (client) => {
    console.log('=== ADD CLIENT DEBUG ===');
    console.log('addClient called with:', client);
    const currentUser = useAppStore.getState().currentUser;
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('No current user found! Cannot add client.');
      return;
    }
    
    if (!currentUser.id) {
      console.error('Current user has no ID! Cannot add client.');
      return;
    }
    
    // Check if user is authenticated in Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No Supabase session found! User not authenticated.');
      return;
    }
    
    console.log('Supabase session found:', session.user.id);
    
    const newClient = { 
      ...client, 
      id: generateId(), 
      createdAt: new Date().toISOString()
    };
    
    console.log('New client object:', newClient);
    
    // Add to local store immediately
    set((state) => ({
      clients: [...state.clients, newClient]
    }));
    
    // Sync to Supabase
    try {
      const supabaseData = {
        id: newClient.id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        company: newClient.company,
        avatar: newClient.avatar,
        status: newClient.status,
        created_by: newClient.createdBy,
        team_id: newClient.teamId,
        created_at: newClient.createdAt
      };
      
      console.log('Sending to Supabase:', supabaseData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert(supabaseData)
        .select();
      
      if (error) {
        console.error('Error syncing client to Supabase:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('Client synced to Supabase successfully');
        console.log('Returned data:', data);
      }
    } catch (error) {
      console.error('Error in addClient:', error);
    }
    console.log('=== END ADD CLIENT DEBUG ===');
  },
  updateClient: (id, client) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...client } : c))
    })),
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
      // Remove clientId from projects when client is deleted
      projects: state.projects.map(project => 
        project.clientId === id 
          ? { ...project, clientId: undefined }
          : project
      )
    })),

  // Theme actions
  setUserTheme: (userId, theme) =>
    set((state) => ({
      users: state.users.map((user) => 
        user.id === userId ? { ...user, theme } : user
      ),
      currentUser: state.currentUser?.id === userId 
        ? { ...state.currentUser, theme }
        : state.currentUser
    })),

  // Invitation actions
  createInvitation: (invitation) => {
    const token = generateId(); // Simple token generation
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    
    set((state) => ({
      invitations: [...state.invitations, {
        ...invitation,
        id: generateId(),
        invitedAt: new Date().toISOString(),
        expiresAt,
        token
      }]
    }));
  },
  updateInvitation: (id, invitation) =>
    set((state) => ({
      invitations: state.invitations.map((inv) => 
        inv.id === id ? { ...inv, ...invitation } : inv
      )
    })),
  deleteInvitation: (id) =>
    set((state) => ({
      invitations: state.invitations.filter((inv) => inv.id !== id)
    })),
  acceptInvitation: (token) =>
    set((state) => {
      const invitation = state.invitations.find(inv => inv.token === token);
      if (!invitation || invitation.status !== 'pending') {
        return state;
      }

      // Create new user from invitation
      const newUser = {
        id: generateId(),
        name: invitation.name || invitation.email.split('@')[0],
        email: invitation.email,
        role: invitation.role,
        theme: 'system' as const
      };

      // Add user to team if teamId is provided
      let updatedTeams = state.teams;
      if (invitation.teamId) {
        updatedTeams = state.teams.map(team => 
          team.id === invitation.teamId 
            ? { ...team, members: [...team.members, newUser] }
            : team
        );
      }

      return {
        users: [...state.users, newUser],
        teams: updatedTeams,
        invitations: state.invitations.map(inv => 
          inv.token === token ? { ...inv, status: 'accepted' } : inv
        )
      };
    }),


}));