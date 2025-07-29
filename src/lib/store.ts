import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Task, Team, Project, Client, Invitation } from '@/types';
import { generateId, calculateTaskCost } from '@/lib/utils';

interface State {
  users: User[];
  tasks: Task[];
  teams: Team[];
  projects: Project[];
  clients: Client[];
  invitations: Invitation[];
  currentUser: User | null;
  currentTeam: Team | null;
}

interface Actions {
  // User actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  
  // Team actions
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  setCurrentTeam: (team: Team | null) => void;
  addMemberToTeam: (teamId: string, userId: string) => void;
  removeMemberFromTeam: (teamId: string, userId: string) => void;
  
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Theme actions
  setUserTheme: (userId: string, theme: 'light' | 'dark' | 'system') => void;
  
  // Invitation actions
  createInvitation: (invitation: Omit<Invitation, 'id' | 'invitedAt' | 'expiresAt' | 'token'>) => void;
  updateInvitation: (id: string, invitation: Partial<Invitation>) => void;
  deleteInvitation: (id: string) => void;
  acceptInvitation: (token: string) => void;
}

export const useAppStore = create<State & Actions>()(
  persist(
    (set) => ({
      users: [],
      tasks: [],
      teams: [],
      projects: [],
      clients: [],
      invitations: [],
      currentUser: null,
      currentTeam: null,

      // User actions
      addUser: (user) => 
        set((state) => ({
          users: [...state.users, { ...user, id: generateId() }]
        })),
      updateUser: (id, user) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...user } : u))
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id)
        })),
      setCurrentUser: (user) =>
        set(() => ({
          currentUser: user
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
      addProject: (project) => 
        set((state) => ({
          projects: [...state.projects, { 
            ...project, 
            id: generateId(), 
            createdAt: new Date().toISOString(),
            tasks: [] // Initialize with an empty array of task IDs
          }]
        })),
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
      addTask: (task) => {
        const newTask = { 
          ...task, 
          id: generateId(), 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cost: task.hourlyRate && task.timeSpent ? calculateTaskCost(task.timeSpent, task.hourlyRate) : 0
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
          projects: state.projects.map(project => 
            project.id === task.projectId 
              ? { ...project, tasks: [...(project.tasks || []), newTask.id] }
              : project
          )
        }));
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
      addClient: (client) => 
        set((state) => ({
          clients: [...state.clients, { 
            ...client, 
            id: generateId(), 
            createdAt: new Date().toISOString()
          }]
        })),
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
    }),
    {
      name: 'team-task-manager',
    }
  )
);