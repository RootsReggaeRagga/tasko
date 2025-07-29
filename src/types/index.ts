export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
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
  teamId: string;
  clientId?: string; // Optional client ID
  category?: 'web-development' | 'mobile-app' | 'design' | 'marketing' | 'seo' | 'ecommerce' | 'consulting';
  createdAt: string;
  tasks: string[]; // Array of task IDs
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
}