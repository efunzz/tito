/**
 * Settings Context - Phase 2: Supabase Sync
 * Provides centralized state management for user settings
 * All screens access the SAME settings from this context
 *
 * Architecture:
 * - Context is the source of truth (in-memory state)
 * - AsyncStorage provides local persistence (instant loading)
 * - Supabase provides cloud sync (background operation)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storage.service';
import { databaseService } from '../services/database.service';

// Define the shape of our context
interface SettingsContextType {
  // Work settings
  hourlyRate: number;
  setHourlyRate: (rate: number) => Promise<void>;
  monthlyGoal: number;
  setMonthlyGoal: (goal: number) => Promise<void>;
  workStartTime: string;
  workEndTime: string;
  setWorkHours: (start: string, end: string) => Promise<void>;

  // App settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  autoClockOut: boolean;
  setAutoClockOut: (enabled: boolean) => Promise<void>;

  // Loading state
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  // State
  const [hourlyRate, setHourlyRateState] = useState<number>(15);
  const [monthlyGoal, setMonthlyGoalState] = useState<number>(1000);
  const [workStartTime, setWorkStartTimeState] = useState<string>('09:00');
  const [workEndTime, setWorkEndTimeState] = useState<string>('17:00');
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);
  const [autoClockOut, setAutoClockOutState] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // PHASE 1: Load from AsyncStorage (instant, offline-first)
      const [
        rate,
        goal,
        workHours,
        notifications,
        autoClockOutSetting,
      ] = await Promise.all([
        storageService.getHourlyRate(),
        storageService.getMonthlyGoal(),
        storageService.getWorkHours(),
        storageService.getNotificationsEnabled(),
        storageService.getAutoClockOut(),
      ]);

      // Update UI immediately with local data
      setHourlyRateState(rate);
      setMonthlyGoalState(goal);
      setWorkStartTimeState(workHours.start);
      setWorkEndTimeState(workHours.end);
      setNotificationsEnabledState(notifications);
      setAutoClockOutState(autoClockOutSetting);
      setLoading(false); // UI is now interactive

      // PHASE 2: Sync from Supabase (background)
      const { data: cloudSettings, error } = await databaseService.getUserSettings();

      if (!error && cloudSettings) {
        // Update from Supabase (cloud is source of truth)
        setHourlyRateState(cloudSettings.hourly_rate);
        setMonthlyGoalState(cloudSettings.monthly_goal);

        // Parse time strings (HH:MM:SS → HH:MM)
        const startTime = cloudSettings.work_start_time.substring(0, 5);
        const endTime = cloudSettings.work_end_time.substring(0, 5);
        setWorkStartTimeState(startTime);
        setWorkEndTimeState(endTime);

        setNotificationsEnabledState(cloudSettings.notifications_enabled);
        setAutoClockOutState(cloudSettings.auto_clock_out);

        // Save to AsyncStorage
        await Promise.all([
          storageService.saveHourlyRate(cloudSettings.hourly_rate),
          storageService.saveMonthlyGoal(cloudSettings.monthly_goal),
          storageService.saveWorkHours(startTime, endTime),
          storageService.saveNotificationsEnabled(cloudSettings.notifications_enabled),
          storageService.saveAutoClockOut(cloudSettings.auto_clock_out),
        ]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setting operations
  const setHourlyRate = async (rate: number) => {
    try {
      // 1. Optimistic update
      setHourlyRateState(rate);

      // 2. Save to AsyncStorage + Supabase in parallel
      await Promise.allSettled([
        storageService.saveHourlyRate(rate),
        databaseService.updateHourlyRate(rate),
      ]);
    } catch (error) {
      console.error('Error saving hourly rate:', error);
      throw error;
    }
  };

  const setMonthlyGoal = async (goal: number) => {
    try {
      // 1. Optimistic update
      setMonthlyGoalState(goal);

      // 2. Save to AsyncStorage + Supabase in parallel
      await Promise.allSettled([
        storageService.saveMonthlyGoal(goal),
        databaseService.updateMonthlyGoal(goal),
      ]);
    } catch (error) {
      console.error('Error saving monthly goal:', error);
      throw error;
    }
  };

  const setWorkHours = async (start: string, end: string) => {
    try {
      // 1. Optimistic update
      setWorkStartTimeState(start);
      setWorkEndTimeState(end);

      // 2. Save to AsyncStorage + Supabase in parallel
      // Convert HH:MM to HH:MM:SS for database
      const startTime = `${start}:00`;
      const endTime = `${end}:00`;

      await Promise.allSettled([
        storageService.saveWorkHours(start, end),
        databaseService.updateWorkHours(startTime, endTime),
      ]);
    } catch (error) {
      console.error('Error saving work hours:', error);
      throw error;
    }
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    try {
      // 1. Optimistic update
      setNotificationsEnabledState(enabled);

      // 2. Save to AsyncStorage + Supabase in parallel
      await Promise.allSettled([
        storageService.saveNotificationsEnabled(enabled),
        databaseService.updateNotifications(enabled),
      ]);
    } catch (error) {
      console.error('Error saving notifications setting:', error);
      throw error;
    }
  };

  const setAutoClockOut = async (enabled: boolean) => {
    try {
      // 1. Optimistic update
      setAutoClockOutState(enabled);

      // 2. Save to AsyncStorage + Supabase in parallel
      await Promise.allSettled([
        storageService.saveAutoClockOut(enabled),
        databaseService.updateAutoClockOut(enabled),
      ]);
    } catch (error) {
      console.error('Error saving auto clock out setting:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  const value: SettingsContextType = {
    hourlyRate,
    setHourlyRate,
    monthlyGoal,
    setMonthlyGoal,
    workStartTime,
    workEndTime,
    setWorkHours,
    notificationsEnabled,
    setNotificationsEnabled,
    autoClockOut,
    setAutoClockOut,
    loading,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use the context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
