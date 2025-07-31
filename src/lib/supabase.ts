import { createClient } from '@supabase/supabase-js';
import { useAppStore } from './store';
import { Task, Project, Client, Team, User } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wjefekwnlznwgnxxahxu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZWZla3dubHpud2dueHhhaHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjExOTUsImV4cCI6MjA2OTAzNzE5NX0.a0gmfaPlyrPN-V3ldgn7';

// Create a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'tasko-app'
    }
  }
});

// Helper function to clear cache and refresh data
export const refreshSupabaseData = async () => {
  try {
    // Clear any cached data
    await supabase.auth.refreshSession();
    
    // Force a fresh connection - try both tables
    try {
      await supabase.from('profiles').select('*').limit(1);
    } catch (error) {
      console.log('profiles table not found, trying users table');
      await supabase.from('users').select('*').limit(1);
    }
    
    console.log('Supabase data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing Supabase data:', error);
  }
};

// Helper function to sync user data
export const syncUserData = async (userId: string) => {
  try {
    // Try profiles table first
    let { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('profiles table not found, trying users table');
      // Try users table as fallback
      const result = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      userData = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error syncing user data:', error);
      return null;
    }

    console.log('User data synced from Supabase:', userData);
    return userData;
  } catch (error) {
    console.error('Error in syncUserData:', error);
    return null;
  }
};

// Helper function to sync currentUser to profiles table
export const syncCurrentUserToProfiles = async (user: User) => {
  try {
    console.log('Syncing currentUser to profiles table:', user);
    
    // Check if user already exists in profiles
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing user:', checkError);
      return false;
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          theme: user.theme,
          hourly_rate: user.hourlyRate,
          team_id: user.teamId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user in profiles:', updateError);
        return false;
      }
      
      console.log('User updated in profiles table successfully');
    } else {
      // Insert new user
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          theme: user.theme,
          hourly_rate: user.hourlyRate,
          team_id: user.teamId,
          created_at: user.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting user to profiles:', insertError);
        return false;
      }
      
      console.log('User inserted to profiles table successfully');
    }

    return true;
  } catch (error) {
    console.error('Error in syncCurrentUserToProfiles:', error);
    return false;
  }
};

// Helper function to get currentUser from profiles table
export const getCurrentUserFromProfiles = async (userId: string): Promise<User | null> => {
  try {
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user from profiles:', error);
      return null;
    }

    if (!userData) {
      console.log('User not found in profiles table');
      return null;
    }

    // Map Supabase data to User interface
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      role: userData.role,
      theme: userData.theme,
      hourlyRate: userData.hourly_rate,
      teamId: userData.team_id,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    };

    console.log('User loaded from profiles table:', user);
    return user;
  } catch (error) {
    console.error('Error in getCurrentUserFromProfiles:', error);
    return null;
  }
};

// Helper function to load data from Supabase and update store
export const loadDataFromSupabase = async () => {
  try {
    const store = useAppStore.getState();
    const currentUser = store.currentUser;

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
      // Update store with tasks data
      // Note: This would need to be implemented in the store
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
      }
    }

  } catch (error) {
    console.error('Error in loadDataFromSupabase:', error);
  }
};

// Helper function to create tables in Supabase (for reference)
export const createTablesInSupabase = async () => {
  console.log('Tables that should exist in Supabase:');
  console.log('- profiles (users table)');
  console.log('- tasks');
  console.log('- projects');
  console.log('- clients');
  console.log('- teams');
  console.log('Please create these tables manually in Supabase Dashboard');
};

// Helper function to check database structure
export const checkDatabaseStructure = async () => {
  try {
    console.log('Checking database structure...');
    
    // Check what tables exist
    const tables = ['profiles', 'users', 'tasks', 'teams', 'projects', 'clients'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`Table ${table}: ${error.message}`);
        } else {
          console.log(`Table ${table}: exists with ${data?.length || 0} records`);
        }
      } catch (error) {
        console.log(`Table ${table}: not accessible`);
      }
    }
  } catch (error) {
    console.error('Error checking database structure:', error);
  }
}; 