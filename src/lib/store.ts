import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Task, Team, Project } from '@/types';
import { generateId } from '@/lib/utils';

interface State {
  users: User[];
  tasks: Task[];
  teams: Team[];
  projects: Project[];
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
}

export const useAppStore = create<State & Actions>()(
  persist(
    (set) => ({
      users: [],
      tasks: [],
      teams: [],
      projects: [],
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
          updatedAt: new Date().toISOString()
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
          const updatedTasks = state.tasks.map((t) => 
            t.id === id 
              ? { ...t, ...task, updatedAt: new Date().toISOString() } 
              : t
          );
          
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
    }),
    {
      name: 'team-task-manager',
    }
  )
);