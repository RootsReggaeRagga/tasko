import { useAppStore } from './store';
import { Task, Project, Client, User } from '@/types';

// Get tasks for a specific user (their own tasks + team tasks)
export const getTasksForUser = (userId: string): Task[] => {
  const state = useAppStore.getState();
  return state.tasks.filter(task => 
    task.createdById === userId || 
    task.assigneeId === userId ||
    (state.currentUser?.teamId && task.projectId && 
     state.projects.find(p => p.id === task.projectId)?.teamId === state.currentUser.teamId)
  );
};

// Get projects for a specific user (projects from their teams)
export const getProjectsForUser = (userId: string): Project[] => {
  const state = useAppStore.getState();
  return state.projects.filter(project => 
    project.teamId && 
    state.teams.find(team => team.id === project.teamId)?.members.some(member => member.id === userId)
  );
};

// Get clients for a specific user (their own clients + team clients)
export const getClientsForUser = (userId: string): Client[] => {
  const state = useAppStore.getState();
  return state.clients.filter(client => 
    client.createdBy === userId ||
    (state.currentUser?.teamId && client.teamId === state.currentUser.teamId)
  );
};

// Get tasks for a specific team
export const getTasksForTeam = (teamId: string): Task[] => {
  const state = useAppStore.getState();
  return state.tasks.filter(task => 
    task.projectId && 
    state.projects.find(p => p.id === task.projectId)?.teamId === teamId
  );
};

// Get projects for a specific team
export const getProjectsForTeam = (teamId: string): Project[] => {
  const state = useAppStore.getState();
  return state.projects.filter(project => project.teamId === teamId);
};

// Get clients for a specific team
export const getClientsForTeam = (teamId: string): Client[] => {
  const state = useAppStore.getState();
  return state.clients.filter(client => client.teamId === teamId);
};

// Get current user's workspace data
export const getCurrentUserWorkspace = () => {
  const state = useAppStore.getState();
  const currentUser = state.currentUser;
  
  if (!currentUser) {
    return {
      tasks: [],
      projects: [],
      clients: []
    };
  }

  return {
    tasks: getTasksForUser(currentUser.id),
    projects: getProjectsForUser(currentUser.id),
    clients: getClientsForUser(currentUser.id)
  };
};

// Check if user has access to a specific resource
export const hasAccessToResource = (userId: string, resourceType: 'task' | 'project' | 'client', resourceId: string): boolean => {
  const state = useAppStore.getState();
  
  switch (resourceType) {
    case 'task':
      const task = state.tasks.find(t => t.id === resourceId);
      return task ? (task.createdById === userId || task.assigneeId === userId) : false;
      
    case 'project':
      const project = state.projects.find(p => p.id === resourceId);
      return project ? state.teams.find(team => team.id === project.teamId)?.members.some(member => member.id === userId) || false : false;
      
    case 'client':
      const client = state.clients.find(c => c.id === resourceId);
      return client ? (client.createdBy === userId) : false;
      
    default:
      return false;
  }
};

// Get team members for a specific team
export const getTeamMembers = (teamId: string): User[] => {
  const state = useAppStore.getState();
  const team = state.teams.find(t => t.id === teamId);
  return team ? team.members : [];
};

// Check if current user is admin
export const isCurrentUserAdmin = (): boolean => {
  const state = useAppStore.getState();
  return state.currentUser?.role === 'admin';
};

// Check if current user is in a specific team
export const isCurrentUserInTeam = (teamId: string): boolean => {
  const state = useAppStore.getState();
  const currentUser = state.currentUser;
  if (!currentUser) return false;
  
  const team = state.teams.find(t => t.id === teamId);
  return team ? team.members.some(member => member.id === currentUser.id) : false;
}; 