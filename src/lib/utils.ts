import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TaskStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function formatDate(date: string | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export function formatDuration(minutes: number) {
  if (minutes === undefined || minutes === null || minutes < 0) return "00:00";
  
  // Handle both integer minutes and floating point values
  const totalSeconds = Math.floor(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export function getInitials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function getStatusColor(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "bg-slate-500 hover:bg-slate-500";
    case "in-progress":
      return "bg-amber-500 hover:bg-amber-500";
    case "testing":
      return "bg-blue-500 hover:bg-blue-500";
    case "reopen":
      return "bg-purple-500 hover:bg-purple-500";
    case "done":
      return "bg-green-500 hover:bg-green-500";
    default:
      return "bg-slate-500 hover:bg-slate-500";
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "low":
      return "bg-slate-500 hover:bg-slate-500";
    case "medium":
      return "bg-amber-500 hover:bg-amber-500";
    case "high":
      return "bg-red-500 hover:bg-red-500";
    default:
      return "bg-slate-500 hover:bg-slate-500";
  }
}

export function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function calculateTaskCost(timeSpentMinutes: number, hourlyRate: number): number {
  const hoursSpent = timeSpentMinutes / 60;
  return Math.round(hoursSpent * hourlyRate * 100) / 100; // Round to 2 decimal places
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
}

export function calculateProjectCosts(tasks: any[], projectHourlyRate?: number): {
  totalCost: number;
  totalTime: number;
  averageHourlyRate: number;
} {
  let totalCost = 0;
  let totalTime = 0;
  let totalRate = 0;
  let rateCount = 0;

  tasks.forEach(task => {
    if (task.timeSpent && task.timeSpent > 0) {
      const taskHourlyRate = task.hourlyRate || projectHourlyRate || 0;
      const taskCost = calculateTaskCost(task.timeSpent, taskHourlyRate);
      
      totalCost += taskCost;
      totalTime += task.timeSpent;
      
      if (taskHourlyRate > 0) {
        totalRate += taskHourlyRate;
        rateCount++;
      }
    }
  });

  const averageHourlyRate = rateCount > 0 ? totalRate / rateCount : 0;

  return {
    totalCost,
    totalTime,
    averageHourlyRate
  };
}