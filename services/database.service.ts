import { supabase } from '../lib/supabase';
import { Shift, Break as ShiftBreak } from '../constants/types';

/**
 * Database Service - Supabase Operations
 * Handles all CRUD operations for shifts and user_settings tables
 */

// ==================== TYPES ====================

export type DatabaseShift = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  clock_in: string; // ISO 8601 timestamp
  clock_out: string | null;
  breaks: ShiftBreak[];
  total_hours: number | null;
  hourly_rate: number;
  earnings: number | null;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  hourly_rate: number;
  monthly_goal: number;
  work_start_time: string; // HH:MM:SS
  work_end_time: string; // HH:MM:SS
  notifications_enabled: boolean;
  auto_clock_out: boolean;
  created_at: string;
  updated_at: string;
};

// ==================== SHIFTS ====================

export const databaseService = {
  // Get all shifts for current user
  getShifts: async (): Promise<{ data: Shift[] | null; error: Error | null }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: new Error('Not authenticated') };
      }

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Transform database format to app format
      const shifts: Shift[] = (data || []).map((dbShift: DatabaseShift) => ({
        id: dbShift.id,
        date: dbShift.date,
        clockIn: dbShift.clock_in,
        clockOut: dbShift.clock_out,
        breaks: dbShift.breaks || [],
        totalHours: dbShift.total_hours || 0,
        hourlyRate: dbShift.hourly_rate,
        earnings: dbShift.earnings || 0,
      }));

      return { data: shifts, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  // Add a new shift
  addShift: async (shift: Shift): Promise<{ success: boolean; error: Error | null }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: new Error('Not authenticated') };
      }

      const { error } = await supabase.from('shifts').insert({
        id: shift.id,
        user_id: user.id,
        date: shift.date,
        clock_in: shift.clockIn,
        clock_out: shift.clockOut,
        breaks: shift.breaks,
        total_hours: shift.totalHours,
        hourly_rate: shift.hourlyRate,
        earnings: shift.earnings,
      });

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  },

  // Update an existing shift
  updateShift: async (shift: Shift): Promise<{ success: boolean; error: Error | null }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: new Error('Not authenticated') };
      }

      const { error } = await supabase
        .from('shifts')
        .update({
          date: shift.date,
          clock_in: shift.clockIn,
          clock_out: shift.clockOut,
          breaks: shift.breaks,
          total_hours: shift.totalHours,
          hourly_rate: shift.hourlyRate,
          earnings: shift.earnings,
        })
        .eq('id', shift.id)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  },

  // Delete a shift
  deleteShift: async (shiftId: string): Promise<{ success: boolean; error: Error | null }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: new Error('Not authenticated') };
      }

      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  },

  // Get shifts for a specific date range
  getShiftsByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<{ data: Shift[] | null; error: Error | null }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: new Error('Not authenticated') };
      }

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      const shifts: Shift[] = (data || []).map((dbShift: DatabaseShift) => ({
        id: dbShift.id,
        date: dbShift.date,
        clockIn: dbShift.clock_in,
        clockOut: dbShift.clock_out,
        breaks: dbShift.breaks || [],
        totalHours: dbShift.total_hours || 0,
        hourlyRate: dbShift.hourly_rate,
        earnings: dbShift.earnings || 0,
      }));

      return { data: shifts, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  // ==================== USER SETTINGS ====================

  // Get user settings
  getUserSettings: async (): Promise<{ data: UserSettings | null; error: Error | null }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: new Error('Not authenticated') };
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no settings exist, create default settings
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: createError } = await supabase
            .from('user_settings')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (createError) {
            return { data: null, error: new Error(createError.message) };
          }

          return { data: newSettings, error: null };
        }

        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  },

  // Update user settings
  updateUserSettings: async (
    settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; error: Error | null }> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: new Error('Not authenticated') };
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        })
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err as Error };
    }
  },

  // Update specific setting fields
  updateHourlyRate: async (rate: number): Promise<{ success: boolean; error: Error | null }> => {
    return databaseService.updateUserSettings({ hourly_rate: rate });
  },

  updateMonthlyGoal: async (goal: number): Promise<{ success: boolean; error: Error | null }> => {
    return databaseService.updateUserSettings({ monthly_goal: goal });
  },

  updateWorkHours: async (
    startTime: string,
    endTime: string
  ): Promise<{ success: boolean; error: Error | null }> => {
    return databaseService.updateUserSettings({
      work_start_time: startTime,
      work_end_time: endTime,
    });
  },

  updateNotifications: async (enabled: boolean): Promise<{ success: boolean; error: Error | null }> => {
    return databaseService.updateUserSettings({ notifications_enabled: enabled });
  },

  updateAutoClockOut: async (enabled: boolean): Promise<{ success: boolean; error: Error | null }> => {
    return databaseService.updateUserSettings({ auto_clock_out: enabled });
  },
};
