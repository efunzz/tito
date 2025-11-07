/**
 * Tito App - Shared TypeScript Types
 * Centralized type definitions used across the app
 */

// User authentication state
export type Status = 'idle' | 'clocked-in' | 'on-break';

// Shift data structure
export type Shift = {
  id: string;
  date: string;              // ISO format: "2024-11-07"
  clockIn: string;           // "09:30 AM" format
  clockOut: string | null;   // "05:30 PM" or null if still active
  breaks: Break[];
  totalHours: number;
  hourlyRate: number;
  earnings: number;
};

// Break data structure
export type Break = {
  start: string;  // ISO timestamp
  end: string | null;  // ISO timestamp or null if break is ongoing
};

// User settings
export type UserSettings = {
  hourlyRate: number;
  monthlyGoal: number;
  workStartTime: string;  // 24-hour format: "09:00"
  workEndTime: string;    // 24-hour format: "17:00"
  notificationsEnabled: boolean;
  autoClockOut: boolean;
};

// Week day for calendar view
export interface WeekDay {
  day: string;        // "Mon", "Tue", etc.
  date: number;       // Day of month
  fullDate: string;   // ISO: "2024-11-07"
  active: boolean;    // Is this the selected day?
}

// Navigation types
// Root stack contains auth screens and the main tab navigator
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainApp: undefined;
  // Also include tab screens for easier type access
  Home: undefined;
  Details: undefined;
  Profile: undefined;
};

// Tab navigator types (subset of RootStackParamList)
export type TabParamList = {
  Home: undefined;
  Details: undefined;
  Profile: undefined;
};

// Supabase user type (simplified)
export type User = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
};

// API response types
export type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Export data format options
export type ExportFormat = 'pdf' | 'csv' | 'json';
export type ExportPeriod = 'week' | 'month' | 'all';
