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

// Helper function to check table permissions
export const checkTablePermissions = async () => {
  try {
    console.log('Checking table permissions...');
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No authenticated session found - testing as anonymous user');
    } else {
      console.log('Authenticated user:', session.user.id);
    }
    
    // Test insert permissions
    const testData = {
      id: 'test-' + Date.now(),
      name: 'Test Item',
      created_at: new Date().toISOString()
    };
    
    // Test tasks table
    try {
      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(testData);
      
      if (tasksError) {
        console.error('Tasks table insert permission error:', tasksError);
        if (tasksError.code === '42501') {
          console.error('Tasks table: RLS policy might be blocking insert');
        }
      } else {
        console.log('Tasks table: INSERT permission OK');
        // Clean up test data
        await supabase.from('tasks').delete().eq('id', testData.id);
      }
    } catch (error) {
      console.error('Tasks table: INSERT permission denied');
    }
    
    // Test projects table
    try {
      const { error: projectsError } = await supabase
        .from('projects')
        .insert(testData);
      
      if (projectsError) {
        console.error('Projects table insert permission error:', projectsError);
        if (projectsError.code === '42501') {
          console.error('Projects table: RLS policy might be blocking insert');
        }
      } else {
        console.log('Projects table: INSERT permission OK');
        // Clean up test data
        await supabase.from('projects').delete().eq('id', testData.id);
      }
    } catch (error) {
      console.error('Projects table: INSERT permission denied');
    }
    
    // Test clients table
    try {
      const { error: clientsError } = await supabase
        .from('clients')
        .insert(testData);
      
      if (clientsError) {
        console.error('Clients table insert permission error:', clientsError);
        if (clientsError.code === '42501') {
          console.error('Clients table: RLS policy might be blocking insert');
        }
      } else {
        console.log('Clients table: INSERT permission OK');
        // Clean up test data
        await supabase.from('clients').delete().eq('id', testData.id);
      }
    } catch (error) {
      console.error('Clients table: INSERT permission denied');
    }
    
  } catch (error) {
    console.error('Error checking table permissions:', error);
  }
}; 

// Helper function to check table structure
export const checkTableStructure = async () => {
  try {
    console.log('=== CHECKING TABLE STRUCTURE ===');
    
    const tables = ['profiles', 'tasks', 'projects', 'clients', 'teams'];
    
    for (const table of tables) {
      try {
        console.log(`\n--- Checking table: ${table} ---`);
        
        // Try to get table structure by selecting one row
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`Error accessing ${table}:`, error);
          if (error.code === '42P01') {
            console.error(`Table ${table} does not exist!`);
          } else if (error.code === '42501') {
            console.error(`Table ${table} exists but no permission to access!`);
          }
        } else {
          console.log(`Table ${table} exists and is accessible`);
          if (data && data.length > 0) {
            console.log(`Sample row from ${table}:`, data[0]);
            console.log(`Columns in ${table}:`, Object.keys(data[0]));
          } else {
            console.log(`Table ${table} is empty`);
          }
        }
      } catch (error) {
        console.error(`Error checking ${table}:`, error);
      }
    }
    
    console.log('=== END TABLE STRUCTURE CHECK ===');
  } catch (error) {
    console.error('Error in checkTableStructure:', error);
  }
}; 

// Helper function to test INSERT operations
export const testInsertOperations = async () => {
  try {
    console.log('=== TESTING INSERT OPERATIONS ===');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No authenticated session found!');
      return;
    }
    
    console.log('Testing with authenticated user:', session.user.id);
    
    const testData = {
      id: 'test-' + Date.now(),
      created_at: new Date().toISOString()
    };
    
    // Test clients table
    console.log('\n--- Testing clients table ---');
    try {
      const clientData = {
        ...testData,
        name: 'Test Client',
        email: 'test@example.com',
        company: 'Test Company',
        status: 'active',
        created_by: session.user.id,
        team_id: 'test-team-id'
      };
      
      const { data: clientResult, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select();
      
      if (clientError) {
        console.error('Clients INSERT failed:', clientError);
        if (clientError.code === '42501') {
          console.error('RLS policy blocking INSERT on clients table');
        }
      } else {
        console.log('Clients INSERT successful:', clientResult);
        // Clean up
        await supabase.from('clients').delete().eq('id', testData.id);
      }
    } catch (error) {
      console.error('Clients INSERT error:', error);
    }
    
    // Test tasks table
    console.log('\n--- Testing tasks table ---');
    try {
      const taskData = {
        ...testData,
        title: 'Test Task',
        description: 'Test task description',
        status: 'todo',
        priority: 'medium',
        created_by_id: session.user.id,
        assignee_id: session.user.id
      };
      
      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();
      
      if (taskError) {
        console.error('Tasks INSERT failed:', taskError);
        if (taskError.code === '42501') {
          console.error('RLS policy blocking INSERT on tasks table');
        }
      } else {
        console.log('Tasks INSERT successful:', taskResult);
        // Clean up
        await supabase.from('tasks').delete().eq('id', testData.id);
      }
    } catch (error) {
      console.error('Tasks INSERT error:', error);
    }
    
    // Test projects table
    console.log('\n--- Testing projects table ---');
    try {
      const projectData = {
        ...testData,
        name: 'Test Project',
        description: 'Test project description',
        team_id: 'test-team-id'
      };
      
      const { data: projectResult, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select();
      
      if (projectError) {
        console.error('Projects INSERT failed:', projectError);
        if (projectError.code === '42501') {
          console.error('RLS policy blocking INSERT on projects table');
        }
      } else {
        console.log('Projects INSERT successful:', projectResult);
        // Clean up
        await supabase.from('projects').delete().eq('id', testData.id);
      }
    } catch (error) {
      console.error('Projects INSERT error:', error);
    }
    
    console.log('=== END INSERT TESTS ===');
  } catch (error) {
    console.error('Error in testInsertOperations:', error);
  }
}; 

// Helper function to get exact table structure
export const getTableStructure = async () => {
  try {
    console.log('=== GETTING EXACT TABLE STRUCTURE ===');
    
    const tables = ['profiles', 'tasks', 'projects', 'clients', 'teams'];
    
    for (const table of tables) {
      try {
        console.log(`\n--- Table: ${table} ---`);
        
        // Try to get one row to see structure
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`Error accessing ${table}:`, error);
        } else {
          if (data && data.length > 0) {
            console.log(`Columns in ${table}:`, Object.keys(data[0]));
            console.log(`Sample data from ${table}:`, data[0]);
          } else {
            console.log(`Table ${table} is empty`);
            
            // Try to insert a test row to see what columns are required
            console.log(`Attempting to insert test row in ${table}...`);
            
            let testData: any = {
              id: 'test-' + Date.now(),
              created_at: new Date().toISOString()
            };
            
            // Add table-specific fields
            if (table === 'clients') {
              testData = {
                ...testData,
                name: 'Test Client',
                email: 'test@example.com',
                company: 'Test Company',
                status: 'active'
              };
            } else if (table === 'tasks') {
              testData = {
                ...testData,
                title: 'Test Task',
                description: 'Test task',
                status: 'todo',
                priority: 'medium'
              };
            } else if (table === 'projects') {
              testData = {
                ...testData,
                name: 'Test Project',
                description: 'Test project'
              };
            } else if (table === 'teams') {
              testData = {
                ...testData,
                name: 'Test Team',
                description: 'Test team'
              };
            }
            
            const { data: insertData, error: insertError } = await supabase
              .from(table)
              .insert(testData)
              .select();
            
            if (insertError) {
              console.error(`Insert error for ${table}:`, insertError);
              console.error(`Error details:`, {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint
              });
            } else {
              console.log(`Successfully inserted test row in ${table}:`, insertData);
              // Clean up
              await supabase.from(table).delete().eq('id', testData.id);
            }
          }
        }
      } catch (error) {
        console.error(`Error checking ${table}:`, error);
      }
    }
    
    console.log('=== END TABLE STRUCTURE CHECK ===');
  } catch (error) {
    console.error('Error in getTableStructure:', error);
  }
}; 

// Helper function to check and fix profiles table structure
export const checkAndFixProfilesTable = async () => {
  try {
    console.log('=== CHECKING AND FIXING PROFILES TABLE ===');
    
    // Check current structure
    const { data: currentData, error: currentError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (currentError) {
      console.error('Error accessing profiles table:', currentError);
      return;
    }
    
    console.log('Current profiles table structure:', currentData && currentData.length > 0 ? Object.keys(currentData[0]) : 'Empty table');
    
    // Check if we have a user to work with
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No authenticated session, skipping profile update');
      return;
    }
    
    // Try to update user with missing fields
    const updateData: any = {};
    
    // Add email if missing
    if (session.user.email) {
      updateData.email = session.user.email;
    }
    
    // Add default theme if missing
    updateData.theme = 'system';
    
    // Add default hourly_rate if missing
    updateData.hourly_rate = 50;
    
    // Add default team_id if missing (we'll create one)
    const teamId = 'default-team-' + session.user.id;
    updateData.team_id = teamId;
    
    console.log('Updating profile with:', updateData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', session.user.id)
      .select();
    
    if (updateError) {
      console.error('Error updating profile:', updateError);
      console.error('This might be because columns do not exist in the table');
      console.error('You need to add these columns to the profiles table in Supabase:');
      console.error('- email (text)');
      console.error('- theme (text)');
      console.error('- hourly_rate (numeric)');
      console.error('- team_id (uuid)');
    } else {
      console.log('Profile updated successfully:', updateResult);
    }
    
    console.log('=== END PROFILES TABLE CHECK ===');
  } catch (error) {
    console.error('Error in checkAndFixProfilesTable:', error);
  }
}; 

// Helper function to add missing columns to profiles table
export const addMissingColumnsToProfiles = async () => {
  try {
    console.log('=== ADDING MISSING COLUMNS TO PROFILES TABLE ===');
    
    // SQL commands to add missing columns
    const sqlCommands = [
      'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;',
      'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT \'system\';',
      'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 50;',
      'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_id uuid;'
    ];
    
    console.log('SQL commands to run in Supabase SQL Editor:');
    sqlCommands.forEach((sql, index) => {
      console.log(`${index + 1}. ${sql}`);
    });
    
    console.log('\nPlease run these SQL commands in Supabase Dashboard > SQL Editor');
    console.log('After running the commands, refresh the page and try again.');
    
    console.log('=== END ADDING MISSING COLUMNS ===');
  } catch (error) {
    console.error('Error in addMissingColumnsToProfiles:', error);
  }
}; 

// Helper function to check if teams table exists and create it if needed
export const checkAndCreateTeamsTable = async () => {
  try {
    console.log('=== CHECKING TEAMS TABLE ===');
    
    // Try to access teams table
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1);
    
    if (teamsError) {
      console.error('Teams table error:', teamsError);
      if (teamsError.code === '42P01') {
        console.error('Teams table does not exist!');
        console.error('You need to create the teams table in Supabase.');
        console.error('SQL to create teams table:');
        console.error(`
CREATE TABLE public.teams (
  id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);
        `);
      }
    } else {
      console.log('Teams table exists and is accessible');
      console.log('Sample teams data:', teamsData);
    }
    
    console.log('=== END TEAMS TABLE CHECK ===');
  } catch (error) {
    console.error('Error in checkAndCreateTeamsTable:', error);
  }
}; 

// Helper function to check tasks table structure
export const checkTasksTableStructure = async () => {
  try {
    console.log('=== CHECKING TASKS TABLE STRUCTURE ===');
    
    // Try to access tasks table
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.error('Tasks table error:', tasksError);
      if (tasksError.code === '42P01') {
        console.error('Tasks table does not exist!');
        console.error('You need to create the tasks table in Supabase.');
        console.error('SQL to create tasks table:');
        console.error(`
CREATE TABLE public.tasks (
  id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL,
  priority text NOT NULL,
  assignee_id uuid,
  created_by_id uuid NOT NULL,
  project_id uuid NOT NULL,
  due_date timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  tags text[],
  time_estimate integer,
  time_spent integer,
  time_started timestamp without time zone,
  time_tracking jsonb,
  hourly_rate numeric,
  cost numeric,
  CONSTRAINT tasks_pkey PRIMARY KEY (id)
);
        `);
      }
    } else {
      console.log('Tasks table exists and is accessible');
      console.log('Sample tasks data:', tasksData);
      
      // Get table structure
      const { data: structureData, error: structureError } = await supabase
        .rpc('get_table_structure', { table_name: 'tasks' });
      
      if (structureError) {
        console.error('Error getting table structure:', structureError);
      } else {
        console.log('Tasks table structure:', structureData);
      }
    }
    
    console.log('=== END TASKS TABLE CHECK ===');
  } catch (error) {
    console.error('Error in checkTasksTableStructure:', error);
  }
}; 