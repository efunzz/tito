/**
 * Storage Service
 * Centralizes all AsyncStorage operations
 * Following D.R.Y. principle - single source of truth for local storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Shift, UserSettings, Status } from '../constants/types';

// Storage keys constants
const STORAGE_KEYS = {
  SHIFTS: 'shifts',
  HOURLY_RATE: 'hourlyRate',
  MONTHLY_GOAL: 'monthlyGoal',
  WORK_START_TIME: 'workStartTime',
  WORK_END_TIME: 'workEndTime',
  STATUS: 'status',
  CURRENT_CLOCK_IN: 'currentClockIn',
  CURRENT_BREAKS: 'currentBreaks',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  AUTO_CLOCK_OUT: 'autoClockOut',
} as const;

export const storageService = {
  // ===== Shifts =====

  getShifts: async (): Promise<Shift[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SHIFTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading shifts:', error);
      return [];
    }
  },

  saveShifts: async (shifts: Shift[]): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
      return true;
    } catch (error) {
      console.error('Error saving shifts:', error);
      return false;
    }
  },

  addShift: async (shift: Shift): Promise<boolean> => {
    try {
      const shifts = await storageService.getShifts();
      shifts.push(shift);
      return await storageService.saveShifts(shifts);
    } catch (error) {
      console.error('Error adding shift:', error);
      return false;
    }
  },

  // ===== User Settings =====

  getHourlyRate: async (): Promise<number> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HOURLY_RATE);
      return data ? parseFloat(data) : 15; // Default $15/hr
    } catch (error) {
      console.error('Error loading hourly rate:', error);
      return 15;
    }
  },

  saveHourlyRate: async (rate: number): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HOURLY_RATE, rate.toString());
      return true;
    } catch (error) {
      console.error('Error saving hourly rate:', error);
      return false;
    }
  },

  getMonthlyGoal: async (): Promise<number> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_GOAL);
      return data ? parseFloat(data) : 1000; // Default $1000/month
    } catch (error) {
      console.error('Error loading monthly goal:', error);
      return 1000;
    }
  },

  saveMonthlyGoal: async (goal: number): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MONTHLY_GOAL, goal.toString());
      return true;
    } catch (error) {
      console.error('Error saving monthly goal:', error);
      return false;
    }
  },

  getWorkHours: async (): Promise<{ start: string; end: string }> => {
    try {
      const start = await AsyncStorage.getItem(STORAGE_KEYS.WORK_START_TIME);
      const end = await AsyncStorage.getItem(STORAGE_KEYS.WORK_END_TIME);
      return {
        start: start || '09:00',
        end: end || '17:00',
      };
    } catch (error) {
      console.error('Error loading work hours:', error);
      return { start: '09:00', end: '17:00' };
    }
  },

  saveWorkHours: async (start: string, end: string): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_START_TIME, start);
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_END_TIME, end);
      return true;
    } catch (error) {
      console.error('Error saving work hours:', error);
      return false;
    }
  },

  // ===== Current Session State =====

  getStatus: async (): Promise<Status> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STATUS);
      return (data as Status) || 'idle';
    } catch (error) {
      console.error('Error loading status:', error);
      return 'idle';
    }
  },

  saveStatus: async (status: Status): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATUS, status);
      return true;
    } catch (error) {
      console.error('Error saving status:', error);
      return false;
    }
  },

  getCurrentClockIn: async (): Promise<Date | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_CLOCK_IN);
      return data ? new Date(data) : null;
    } catch (error) {
      console.error('Error loading clock in time:', error);
      return null;
    }
  },

  saveCurrentClockIn: async (time: Date | null): Promise<boolean> => {
    try {
      if (time) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_CLOCK_IN, time.toISOString());
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_CLOCK_IN);
      }
      return true;
    } catch (error) {
      console.error('Error saving clock in time:', error);
      return false;
    }
  },

  getCurrentBreaks: async (): Promise<{ start: string; end: string | null }[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BREAKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading current breaks:', error);
      return [];
    }
  },

  saveCurrentBreaks: async (breaks: { start: string; end: string | null }[]): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BREAKS, JSON.stringify(breaks));
      return true;
    } catch (error) {
      console.error('Error saving current breaks:', error);
      return false;
    }
  },

  // ===== App Settings =====

  getNotificationsEnabled: async (): Promise<boolean> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      return data ? JSON.parse(data) : true;
    } catch (error) {
      console.error('Error loading notifications setting:', error);
      return true;
    }
  },

  saveNotificationsEnabled: async (enabled: boolean): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, JSON.stringify(enabled));
      return true;
    } catch (error) {
      console.error('Error saving notifications setting:', error);
      return false;
    }
  },

  getAutoClockOut: async (): Promise<boolean> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_CLOCK_OUT);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Error loading auto clock out setting:', error);
      return false;
    }
  },

  saveAutoClockOut: async (enabled: boolean): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_CLOCK_OUT, JSON.stringify(enabled));
      return true;
    } catch (error) {
      console.error('Error saving auto clock out setting:', error);
      return false;
    }
  },

  // ===== Utility Methods =====

  clearAllData: async (): Promise<boolean> => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },

  clearSessionData: async (): Promise<boolean> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.STATUS,
        STORAGE_KEYS.CURRENT_CLOCK_IN,
        STORAGE_KEYS.CURRENT_BREAKS,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing session data:', error);
      return false;
    }
  },
};

// Export storage keys for direct access if needed
export { STORAGE_KEYS };
