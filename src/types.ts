import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
}

export interface ScheduleItem {
  id: string;
  day: string;
  subject: string;
  time?: string;
}

export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
