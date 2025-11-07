/**
 * Settings Context
 * Provides centralized state management for user settings
 * All screens access the SAME settings from this context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storage.service';

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

      // Load all settings in parallel
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

      setHourlyRateState(rate);
      setMonthlyGoalState(goal);
      setWorkStartTimeState(workHours.start);
      setWorkEndTimeState(workHours.end);
      setNotificationsEnabledState(notifications);
      setAutoClockOutState(autoClockOutSetting);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setting operations
  const setHourlyRate = async (rate: number) => {
    try {
      setHourlyRateState(rate);
      await storageService.saveHourlyRate(rate);

      // TODO: Sync to Supabase in Phase 2
    } catch (error) {
      console.error('Error saving hourly rate:', error);
      throw error;
    }
  };

  const setMonthlyGoal = async (goal: number) => {
    try {
      setMonthlyGoalState(goal);
      await storageService.saveMonthlyGoal(goal);

      // TODO: Sync to Supabase in Phase 2
    } catch (error) {
      console.error('Error saving monthly goal:', error);
      throw error;
    }
  };

  const setWorkHours = async (start: string, end: string) => {
    try {
      setWorkStartTimeState(start);
      setWorkEndTimeState(end);
      await storageService.saveWorkHours(start, end);

      // TODO: Sync to Supabase in Phase 2
    } catch (error) {
      console.error('Error saving work hours:', error);
      throw error;
    }
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    try {
      setNotificationsEnabledState(enabled);
      await storageService.saveNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Error saving notifications setting:', error);
      throw error;
    }
  };

  const setAutoClockOut = async (enabled: boolean) => {
    try {
      setAutoClockOutState(enabled);
      await storageService.saveAutoClockOut(enabled);
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
