/**
 * Shifts Context
 * Provides centralized state management for shifts data
 * All screens access the SAME shifts data from this context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storage.service';
import type { Shift, Status } from '../constants/types';

// Define the shape of our context
interface ShiftsContextType {
  // Shifts data
  shifts: Shift[];
  addShift: (shift: Shift) => Promise<void>;
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  refreshShifts: () => Promise<void>;

  // Current session state
  status: Status;
  setStatus: (status: Status) => Promise<void>;
  clockInTime: Date | null;
  setClockInTime: (time: Date | null) => Promise<void>;
  currentBreaks: { start: string; end: string | null }[];
  setCurrentBreaks: (breaks: { start: string; end: string | null }[]) => Promise<void>;

  // Loading state
  loading: boolean;
}

// Create the context
const ShiftsContext = createContext<ShiftsContextType | undefined>(undefined);

// Provider component
interface ShiftsProviderProps {
  children: ReactNode;
}

export function ShiftsProvider({ children }: ShiftsProviderProps) {
  // State
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [status, setStatusState] = useState<Status>('idle');
  const [clockInTime, setClockInTimeState] = useState<Date | null>(null);
  const [currentBreaks, setCurrentBreaksState] = useState<{ start: string; end: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel for better performance
      const [
        savedShifts,
        savedStatus,
        savedClockIn,
        savedBreaks,
      ] = await Promise.all([
        storageService.getShifts(),
        storageService.getStatus(),
        storageService.getCurrentClockIn(),
        storageService.getCurrentBreaks(),
      ]);

      setShifts(savedShifts);
      setStatusState(savedStatus);
      setClockInTimeState(savedClockIn);
      setCurrentBreaksState(savedBreaks);
    } catch (error) {
      console.error('Error loading shifts data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Shift operations
  const addShift = async (shift: Shift) => {
    try {
      // Optimistic update - update UI immediately
      setShifts(prev => [...prev, shift]);

      // Save to storage
      await storageService.addShift(shift);

      // TODO: Sync to Supabase in Phase 2
    } catch (error) {
      console.error('Error adding shift:', error);
      // Rollback on error
      setShifts(prev => prev.filter(s => s.id !== shift.id));
      throw error;
    }
  };

  const updateShift = async (id: string, updatedData: Partial<Shift>) => {
    try {
      // Optimistic update
      setShifts(prev =>
        prev.map(shift =>
          shift.id === id ? { ...shift, ...updatedData } : shift
        )
      );

      // Save to storage
      const updatedShifts = shifts.map(shift =>
        shift.id === id ? { ...shift, ...updatedData } : shift
      );
      await storageService.saveShifts(updatedShifts);

      // TODO: Sync to Supabase in Phase 2
    } catch (error) {
      console.error('Error updating shift:', error);
      // Rollback on error
      await loadData();
      throw error;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      // Optimistic update
      const deletedShift = shifts.find(s => s.id === id);
      setShifts(prev => prev.filter(s => s.id !== id));

      // Save to storage
      await storageService.saveShifts(shifts.filter(s => s.id !== id));

      // TODO: Sync to Supabase in Phase 2
    } catch (error) {
      console.error('Error deleting shift:', error);
      // Rollback on error
      await loadData();
      throw error;
    }
  };

  const refreshShifts = async () => {
    await loadData();
  };

  // Session state operations
  const setStatus = async (newStatus: Status) => {
    try {
      setStatusState(newStatus);
      await storageService.saveStatus(newStatus);
    } catch (error) {
      console.error('Error saving status:', error);
      throw error;
    }
  };

  const setClockInTime = async (time: Date | null) => {
    try {
      setClockInTimeState(time);
      await storageService.saveCurrentClockIn(time);
    } catch (error) {
      console.error('Error saving clock in time:', error);
      throw error;
    }
  };

  const setCurrentBreaks = async (breaks: { start: string; end: string | null }[]) => {
    try {
      setCurrentBreaksState(breaks);
      await storageService.saveCurrentBreaks(breaks);
    } catch (error) {
      console.error('Error saving breaks:', error);
      throw error;
    }
  };

  const value: ShiftsContextType = {
    shifts,
    addShift,
    updateShift,
    deleteShift,
    refreshShifts,
    status,
    setStatus,
    clockInTime,
    setClockInTime,
    currentBreaks,
    setCurrentBreaks,
    loading,
  };

  return (
    <ShiftsContext.Provider value={value}>
      {children}
    </ShiftsContext.Provider>
  );
}

// Custom hook to use the context
export function useShifts() {
  const context = useContext(ShiftsContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftsProvider');
  }
  return context;
}
