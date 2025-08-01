export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  theme?: 'light' | 'dark' | 'system';
  hourlyRate?: number; // Hourly rate in PLN
  teamId?: string; // Team the user belongs to
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'testing' | 'reopen' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  createdById: string;
  projectId: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  // Time tracking fields
  timeEstimate?: number; // Estimated time in minutes
  timeSpent?: number; // Actual time spent in minutes
  timeStarted?: string; // ISO date string when timer was started
  timeTracking?: TimeTrackingRecord[]; // History of time tracking records
  // Financial fields
  hourlyRate?: number; // Hourly rate for this task in PLN
  cost?: number; // Calculated cost based on time spent and hourly rate
}

export interface TimeTrackingRecord {
  id: string;
  userId: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string, undefined if still tracking
  duration?: number; // Duration in minutes, calculated when endTime is set
  description?: string; // Optional description of what was done
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  team_id: string; // Changed from teamId to team_id to match Supabase
  client_id?: string; // Changed from clientId to client_id to match Supabase
  category?: 'web-development' | 'mobile-app' | 'design' | 'marketing' | 'seo' | 'ecommerce' | 'consulting';
  created_at: string; // Changed from createdAt to created_at to match Supabase
  created_by: string; // Added to match Supabase schema
  tasks: string[]; // Array of task IDs
  // Financial fields
  budget?: number; // Project budget in PLN
  hourly_rate?: number; // Changed from hourlyRate to hourly_rate to match Supabase
  revenue?: number; // Project revenue in PLN
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'inactive';
  createdBy?: string; // User ID who created the client
  teamId?: string; // Team the client belongs to
}

export interface Invitation {
  id: string;
  email: string;
  name?: string;
  teamId?: string;
  projectId?: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string; // User ID who sent the invitation
  invitedAt: string;
  expiresAt: string;
  token: string; // Unique token for invitation link
}