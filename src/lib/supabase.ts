import { createClient } from '@supabase/supabase-js';

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