import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Task, Team, Project, Client, Invitation } from '@/types';
import { generateId, calculateTaskCost } from '@/lib/utils';
import { supabase, checkAndCreateProjectsTable, checkAndFixProjectsTable } from './supabase';

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
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'created_by' | 'team_id' | 'tasks'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => void;
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Data loading actions
  loadDataFromSupabase: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  
  // Theme actions
  setUserTheme: (userId: string, theme: 'light' | 'dark' | 'system') => Promise<void>;
  
  // Invitation actions
  createInvitation: (invitation: Omit<Invitation, 'id' | 'invitedAt' | 'expiresAt' | 'token'>) => void;
  updateInvitation: (id: string, invitation: Partial<Invitation>) => void;
  deleteInvitation: (id: string) => void;
  acceptInvitation: (token: string) => void;
}

export const useAppStore = create<State & Actions>()(
  persist(
    (set, get) => ({
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
        const state = get();
        if (state.isLoading) {
          console.log('Data loading already in progress, skipping');
          return;
        }
        
        const { setLoading } = get();
        setLoading(true);
        
        try {
          const currentUser = get().currentUser;
          if (!currentUser) {
            console.log('No current user, skipping data load');
            return;
          }

          console.log('Loading data from Supabase for user:', currentUser.id);

          // Check if projects table exists
          await checkAndCreateProjectsTable();
          
          // Check and fix projects table structure
          await checkAndFixProjectsTable();

          // Load current user data (including theme) from profiles
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (userError) {
            console.error('Error loading user data:', userError);
          } else {
            console.log('Raw user data from Supabase:', userData);
            console.log('Available columns in userData:', Object.keys(userData || {}));
            
            // Update current user with fresh data from Supabase
            const updatedUser = {
              ...currentUser,
              name: userData.name || currentUser.name,
              email: userData.email || currentUser.email || '',
              avatar: userData.avatar_url || currentUser.avatar || '',
              role: userData.role || currentUser.role,
              theme: userData.theme || currentUser.theme || 'system',
              hourlyRate: userData.hourly_rate || currentUser.hourlyRate || 50,
              teamId: userData.team_id || currentUser.teamId || null,
              createdAt: userData.created_at || currentUser.createdAt,
              updatedAt: userData.updated_at || currentUser.updatedAt
            };
            
            console.log('Updated user object:', updatedUser);
            console.log('Theme from Supabase:', userData.theme);
            console.log('Final theme value:', updatedUser.theme);
            console.log('TeamId from Supabase:', userData.team_id);
            console.log('Final teamId value:', updatedUser.teamId);
            
            set({ currentUser: updatedUser });
            console.log('Updated current user with theme:', updatedUser.theme);
            
            // Check if user has teamId, if not create default team
            if (!updatedUser.teamId) {
              console.log('User has no teamId, creating default team...');
              // Generate proper UUID for team
              const teamId = crypto.randomUUID();
              const defaultTeam = {
                name: `${updatedUser.name}'s Team`,
                description: `Default team for ${updatedUser.name}`,
                members: [updatedUser]
              };
              
              // Add team to local store
              set((state) => ({
                teams: [...state.teams, { 
                  ...defaultTeam, 
                  id: teamId, 
                  createdAt: new Date().toISOString() 
                }]
              }));
              
              // Update current user with teamId
              const userWithTeam = { ...updatedUser, teamId };
              set({ currentUser: userWithTeam });
              
              console.log('Created default team with ID:', teamId);
              console.log('Updated user with teamId:', userWithTeam.teamId);
            }
          }

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
              timeTracking: (() => {
                console.log('Loading time_tracking from Supabase for task:', task.id);
                console.log('Raw time_tracking data:', task.time_tracking);
                return task.time_tracking;
              })(),
              hourlyRate: task.hourly_rate,
              cost: task.cost,
              dueDate: task.due_date,
              createdAt: task.created_at,
              updatedAt: task.updated_at,
              tags: task.tags
            })) || [];
            
            console.log('Setting tasks in store:', tasks.length, 'tasks');
            console.log('Sample task timeTracking:', tasks[0]?.timeTracking);
            set((state) => ({ ...state, tasks }));
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
                client_id: project.client_id,
                team_id: project.team_id,
                category: project.category,
                budget: project.budget,
                hourly_rate: project.hourly_rate,
                revenue: project.revenue,
                created_at: project.created_at,
                created_by: project.created_by,
                tasks: project.tasks || [] // Use tasks from Supabase
              })) || [];
              
              set((state) => ({ ...state, projects }));
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
              
              set((state) => ({ ...state, clients }));
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
            id: crypto.randomUUID(),
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
            id: crypto.randomUUID(), 
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
      addProject: async (project: Omit<Project, 'id' | 'created_at' | 'created_by' | 'team_id' | 'tasks'>) => {
        console.log('=== ADDING PROJECT ===');
        console.log('Project data:', project);
        console.log('Current user:', get().currentUser);
        console.log('Current user teamId:', get().currentUser?.teamId);
        
        if (!get().currentUser?.id) {
          console.error('No current user ID found!');
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
        if (session.user.id !== get().currentUser!.id) {
          console.error('Current user ID mismatch! Local:', get().currentUser!.id, 'Supabase:', session.user.id);
          return;
        }

        // Create project object with correct field names for Supabase
        const newProject: Project = {
          id: crypto.randomUUID(),
          name: project.name,
          description: project.description,
          team_id: get().currentUser!.teamId || crypto.randomUUID(),
          client_id: (project as any).clientId,
          category: (project as any).category,
          created_by: get().currentUser!.id,
          created_at: new Date().toISOString(),
          tasks: [],
          budget: (project as any).budget,
          hourly_rate: (project as any).hourlyRate,
          revenue: (project as any).revenue,
        };

        console.log('New project with IDs:', newProject);

        try {
          const { data, error } = await supabase
            .from('projects')
            .insert([newProject])
            .select();

          if (error) {
            console.error('Error adding project to Supabase:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            return;
          }

          console.log('Project added successfully to Supabase:', data);
          set((state) => ({
            projects: [...state.projects, newProject],
          }));
        } catch (error) {
          console.error('Exception adding project:', error);
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
          id: crypto.randomUUID(), 
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
            time_tracking: newTask.timeTracking,
            hourly_rate: newTask.hourlyRate,
            cost: newTask.cost,
            due_date: newTask.dueDate,
            created_at: newTask.createdAt,
            updated_at: newTask.updatedAt,
            tags: newTask.tags
          };
          
          console.log('Sending task to Supabase:', supabaseData);
          
          // Check required fields according to schema
          if (!supabaseData.title) {
            console.error('Missing title field! (required)');
          }
          
          if (!supabaseData.status) {
            console.error('Missing status field! (required)');
          }
          
          if (!supabaseData.priority) {
            console.error('Missing priority field! (required)');
          }
          
          if (!supabaseData.created_by_id) {
            console.error('Missing created_by_id field! (required)');
          }
          
          if (!supabaseData.project_id) {
            console.error('Missing project_id field! (required)');
          }
          
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
      updateTask: async (id, task) => {
        console.log("=== UPDATE TASK DEBUG ===");
        console.log("updateTask called:", { id, task });
        console.log("task.timeTracking:", task.timeTracking);
        console.log("task.timeStarted:", task.timeStarted);
        
        const currentUser = useAppStore.getState().currentUser;
        if (!currentUser?.id) {
          console.error('No current user found! Cannot update task.');
          return;
        }

        // Update local store immediately
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
          console.log("Updated task locally:", updatedTask);
          
          // Update projects tasks arrays when projectId changes
          let updatedProjects = state.projects;
          if (task.projectId !== undefined && updatedTask) {
            const oldProjectId = updatedTask.projectId;
            const newProjectId = task.projectId;
            
            if (oldProjectId !== newProjectId) {
              console.log(`Moving task ${id} from project ${oldProjectId} to ${newProjectId}`);
              
              updatedProjects = state.projects.map(project => {
                if (project.id === oldProjectId) {
                  // Remove task from old project
                  return {
                    ...project,
                    tasks: Array.isArray(project.tasks) 
                      ? project.tasks.filter(taskId => taskId !== id)
                      : []
                  };
                } else if (project.id === newProjectId) {
                  // Add task to new project
                  return {
                    ...project,
                    tasks: Array.isArray(project.tasks) 
                      ? [...project.tasks, id]
                      : [id]
                  };
                }
                return project;
              });
            }
          }
          
          return {
            tasks: updatedTasks,
            projects: updatedProjects
          };
        });

        // Sync to Supabase
        try {
          const supabaseData: any = {
            updated_at: new Date().toISOString()
          };

          // Map task fields to Supabase column names
          if (task.title !== undefined) supabaseData.title = task.title;
          if (task.description !== undefined) supabaseData.description = task.description;
          if (task.status !== undefined) supabaseData.status = task.status;
          if (task.priority !== undefined) supabaseData.priority = task.priority;
          if (task.assigneeId !== undefined) supabaseData.assignee_id = task.assigneeId;
          if (task.projectId !== undefined) supabaseData.project_id = task.projectId;
          if (task.dueDate !== undefined) supabaseData.due_date = task.dueDate;
          if (task.tags !== undefined) supabaseData.tags = task.tags;
          if (task.timeEstimate !== undefined) supabaseData.time_estimate = task.timeEstimate;
          if (task.timeSpent !== undefined) supabaseData.time_spent = Math.round(task.timeSpent);
          if (task.timeStarted !== undefined) supabaseData.time_started = task.timeStarted;
          if (task.timeTracking !== undefined) {
            console.log('Setting time_tracking in Supabase:', task.timeTracking);
            console.log('timeTracking type:', typeof task.timeTracking);
            console.log('timeTracking length:', Array.isArray(task.timeTracking) ? task.timeTracking.length : 'not array');
            supabaseData.time_tracking = task.timeTracking;
          }
          if (task.hourlyRate !== undefined) supabaseData.hourly_rate = task.hourlyRate;
          if (task.cost !== undefined) supabaseData.cost = task.cost;

          console.log('Sending task update to Supabase:', supabaseData);

          const { data, error } = await supabase
            .from('tasks')
            .update(supabaseData)
            .eq('id', id)
            .select();

          if (error) {
            console.error('Error updating task in Supabase:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            console.error('Task ID:', id);
            console.error('Supabase data sent:', supabaseData);
          } else {
            console.log('Task updated in Supabase successfully:', data);
            
            // If projectId changed, update the projects table in Supabase
            if (task.projectId !== undefined) {
              const currentTask = get().tasks.find(t => t.id === id);
              if (currentTask && currentTask.projectId !== task.projectId) {
                console.log('Updating projects table in Supabase due to projectId change');
                
                // Update old project - remove task
                if (currentTask.projectId) {
                  const oldProject = get().projects.find(p => p.id === currentTask.projectId);
                  if (oldProject) {
                    const updatedOldProjectTasks = oldProject.tasks.filter(taskId => taskId !== id);
                    const { error: oldProjectError } = await supabase
                      .from('projects')
                      .update({ tasks: updatedOldProjectTasks })
                      .eq('id', currentTask.projectId);
                    
                    if (oldProjectError) {
                      console.error('Error updating old project in Supabase:', oldProjectError);
                    }
                  }
                }
                
                // Update new project - add task
                const newProject = get().projects.find(p => p.id === task.projectId);
                if (newProject) {
                  const updatedNewProjectTasks = [...newProject.tasks, id];
                  const { error: newProjectError } = await supabase
                    .from('projects')
                    .update({ tasks: updatedNewProjectTasks })
                    .eq('id', task.projectId);
                  
                  if (newProjectError) {
                    console.error('Error updating new project in Supabase:', newProjectError);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Exception updating task in Supabase:', error);
        }
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
        
        // Check if user has teamId, if not create default team
        if (!currentUser.teamId) {
          console.log('User has no teamId, creating default team...');
          // Generate proper UUID for team
          const teamId = crypto.randomUUID();
          const defaultTeam = {
            name: `${currentUser.name}'s Team`,
            description: `Default team for ${currentUser.name}`,
            members: [currentUser]
          };
          
          // Add team to local store
          set((state) => ({
            teams: [...state.teams, { 
              ...defaultTeam, 
              id: teamId, 
              createdAt: new Date().toISOString() 
            }]
          }));
          
          // Update current user with teamId
          const updatedUser = { ...currentUser, teamId };
          set({ currentUser: updatedUser });
          
          console.log('Created default team with ID:', teamId);
        }
        
        const newClient = { 
          ...client, 
          id: crypto.randomUUID(), 
          createdAt: new Date().toISOString()
        };
        
        console.log('New client object:', newClient);
        
        // Add to local store immediately
        set((state) => ({
          clients: [...state.clients, newClient]
        }));
        
        // Sync to Supabase
        try {
          console.log('=== SYNCING CLIENT TO SUPABASE ===');
          console.log('Current user:', currentUser);
          console.log('New client:', newClient);
          
          // First, let's check what columns exist in the clients table
          const { data: sampleData, error: sampleError } = await supabase
            .from('clients')
            .select('*')
            .limit(1);
          
          if (sampleError) {
            console.error('Error getting sample data from clients table:', sampleError);
          } else {
            console.log('Sample data from clients table:', sampleData);
            if (sampleData && sampleData.length > 0) {
              console.log('Available columns in clients table:', Object.keys(sampleData[0]));
            }
          }
          
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
          
          console.log('Current user teamId:', currentUser.teamId);
          console.log('Client teamId:', newClient.teamId);
          console.log('Sending to Supabase:', supabaseData);
          
          // Check if we have all required fields
          if (!supabaseData.created_by) {
            console.error('Missing created_by field!');
            console.error('currentUser.id:', currentUser.id);
            console.error('newClient.createdBy:', newClient.createdBy);
          }
          
          if (!supabaseData.team_id) {
            console.error('Missing team_id field!');
            console.error('currentUser.teamId:', currentUser.teamId);
            console.error('newClient.teamId:', newClient.teamId);
          }
          
          // Check required fields according to schema
          if (!supabaseData.name) {
            console.error('Missing name field! (required)');
          }
          
          if (!supabaseData.email) {
            console.error('Missing email field! (required)');
          }
          
          if (!supabaseData.company) {
            console.error('Missing company field! (required)');
          }
          
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
        console.log('=== END SYNCING CLIENT ===');
      },
      updateClient: (id, client) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...client } : c))
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          // Remove client_id from projects when client is deleted
          projects: state.projects.map(project => 
            project.client_id === id 
              ? { ...project, client_id: undefined }
              : project
          )
        })),

      // Theme actions
      setUserTheme: async (userId, theme) => {
        console.log('=== SET USER THEME DEBUG ===');
        console.log('setUserTheme called with:', { userId, theme });
        
        // Update local store immediately
        set((state) => ({
          users: state.users.map((user) => 
            user.id === userId ? { ...user, theme } : user
          ),
          currentUser: state.currentUser?.id === userId 
            ? { ...state.currentUser, theme }
            : state.currentUser
        }));
        
        // Sync to Supabase
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.error('No Supabase session found! Cannot update theme.');
            return;
          }
          
          console.log('Updating theme in Supabase for user:', userId);
          
          const { error } = await supabase
            .from('profiles')
            .update({ 
              theme: theme,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
          
          if (error) {
            console.error('Error updating theme in Supabase:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
          } else {
            console.log('Theme updated in Supabase successfully');
          }
        } catch (error) {
          console.error('Error in setUserTheme:', error);
        }
        console.log('=== END SET USER THEME DEBUG ===');
      },

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


    }),
         {
       name: 'app-storage',
     }
  )
);