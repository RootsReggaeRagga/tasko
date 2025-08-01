import { supabase } from './supabase';
import { useAppStore } from './store';
import { Task, Project, Client, Team, User } from '@/types';

// Sync tasks to Supabase
export const syncTasksToSupabase = async () => {
  try {
    const { tasks } = useAppStore.getState();
    
    for (const task of tasks) {
      const { error } = await supabase
        .from('tasks')
        .upsert({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee_id: task.assigneeId,
          created_by_id: task.createdById,
          project_id: task.projectId,
          time_estimate: task.timeEstimate,
          time_spent: task.timeSpent,
          time_started: task.timeStarted,
          hourly_rate: task.hourlyRate,
          cost: task.cost,
          due_date: task.dueDate,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
          tags: task.tags
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing task:', error);
      }
    }
    
    console.log('Tasks synced to Supabase');
  } catch (error) {
    console.error('Error in syncTasksToSupabase:', error);
  }
};

// Sync projects to Supabase
export const syncProjectsToSupabase = async () => {
  try {
    const { projects } = useAppStore.getState();
    
    for (const project of projects) {
      const { error } = await supabase
        .from('projects')
        .upsert({
          id: project.id,
          name: project.name,
          description: project.description,
          client_id: project.client_id,
          team_id: project.team_id,
          category: project.category,
          budget: project.budget,
          hourly_rate: project.hourly_rate,
          revenue: project.revenue,
          created_at: project.created_at
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing project:', error);
      }
    }
    
    console.log('Projects synced to Supabase');
  } catch (error) {
    console.error('Error in syncProjectsToSupabase:', error);
  }
};

// Sync clients to Supabase
export const syncClientsToSupabase = async () => {
  try {
    const { clients } = useAppStore.getState();
    
    for (const client of clients) {
      const { error } = await supabase
        .from('clients')
        .upsert({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          avatar: client.avatar,
          status: client.status,
          created_at: client.createdAt
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing client:', error);
      }
    }
    
    console.log('Clients synced to Supabase');
  } catch (error) {
    console.error('Error in syncClientsToSupabase:', error);
  }
};

// Load data from Supabase
export const loadDataFromSupabase = async () => {
  try {
    console.log('Loading data from Supabase...');
    
    // Load tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    if (!tasksError && tasksData) {
      const tasks: Task[] = tasksData.map(task => ({
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
        tags: task.tags || []
      }));
      
      useAppStore.setState({ tasks });
      console.log('Tasks loaded from Supabase:', tasks.length);
    }

    // Load projects
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (!projectsError && projectsData) {
      const projects: Project[] = projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        client_id: project.client_id,
        team_id: project.team_id,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        created_at: project.created_at,
        created_by: project.created_by,
        tasks: []
      }));
      
      useAppStore.setState({ projects });
      console.log('Projects loaded from Supabase:', projects.length);
    }

    // Load clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (!clientsError && clientsData) {
      const clients: Client[] = clientsData.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        avatar: client.avatar,
        status: client.status || 'active',
        createdAt: client.created_at
      }));
      
      useAppStore.setState({ clients });
      console.log('Clients loaded from Supabase:', clients.length);
    }

    console.log('Data loaded from Supabase successfully');
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
  }
};

// Create tables in Supabase if they don't exist
export const createTablesInSupabase = async () => {
  try {
    console.log('Creating tables in Supabase...');
    
    // Note: This would require admin privileges
    // For now, we'll just log what tables should be created
    const tables = [
      'tasks',
      'projects', 
      'clients',
      'teams'
    ];
    
    console.log('Tables that should exist:', tables);
    console.log('Please create these tables manually in Supabase Dashboard');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}; 