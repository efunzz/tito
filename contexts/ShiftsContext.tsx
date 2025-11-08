/**
 * Shifts Context - Phase 2: Supabase Sync
 * Provides centralized state management for shifts data
 * All screens access the SAME shifts data from this context
 *
 * Architecture:
 * - Context is the source of truth (in-memory state)
 * - AsyncStorage provides local persistence (instant loading)
 * - Supabase provides cloud sync (background operation)
 *
 * Flow:
 * 1. User action → Optimistic Context update → UI updates instantly
 * 2. Save to AsyncStorage (fast) + Supabase (background) in parallel
 * 3. On app start: Load from AsyncStorage → Sync from Supabase → Merge
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService } from '../services/storage.service';
import { databaseService } from '../services/database.service';
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

      // PHASE 1: Load from AsyncStorage (instant, offline-first)
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

      // Update UI immediately with local data
      setShifts(savedShifts);
      setStatusState(savedStatus);
      setClockInTimeState(savedClockIn);
      setCurrentBreaksState(savedBreaks);
      setLoading(false); // UI is now interactive

      // PHASE 2: Sync from Supabase (background)
      const { data: cloudShifts, error } = await databaseService.getShifts();

      if (!error && cloudShifts) {
        // Merge strategy: Supabase is source of truth for completed shifts
        // Only update if Supabase has data (don't overwrite with empty array)
        if (cloudShifts.length > 0 || savedShifts.length === 0) {
          setShifts(cloudShifts);
          await storageService.saveShifts(cloudShifts);
        }
      }
    } catch (error) {
      console.error('Error loading shifts data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Shift operations
  const addShift = async (shift: Shift) => {
    try {
      // 1. Optimistic update - update UI immediately
      setShifts(prev => [...prev, shift]);

      // 2. Save to AsyncStorage + Supabase in parallel
      const [storageSuccess, dbResult] = await Promise.allSettled([
        storageService.addShift(shift),
        databaseService.addShift(shift),
      ]);

      // 3. Handle errors
      if (storageSuccess.status === 'rejected') {
        console.error('AsyncStorage save failed:', storageSuccess.reason);
      }

      if (dbResult.status === 'rejected' || (dbResult.status === 'fulfilled' && !dbResult.value.success)) {
        console.warn('Supabase sync failed, will retry later:', dbResult);
        // Data is safe in AsyncStorage, retry on next app open
      }
    } catch (error) {
      console.error('Error adding shift:', error);
      // Rollback on error
      setShifts(prev => prev.filter(s => s.id !== shift.id));
      throw error;
    }
  };

  const updateShift = async (id: string, updatedData: Partial<Shift>) => {
    try {
      // 1. Optimistic update
      setShifts(prev =>
        prev.map(shift =>
          shift.id === id ? { ...shift, ...updatedData } : shift
        )
      );

      // 2. Get updated shift for Supabase
      const updatedShift = shifts.find(s => s.id === id);
      if (!updatedShift) throw new Error('Shift not found');

      const fullUpdatedShift = { ...updatedShift, ...updatedData };

      // 3. Save to AsyncStorage + Supabase in parallel
      const updatedShifts = shifts.map(shift =>
        shift.id === id ? fullUpdatedShift : shift
      );

      await Promise.allSettled([
        storageService.saveShifts(updatedShifts),
        databaseService.updateShift(fullUpdatedShift),
      ]);
    } catch (error) {
      console.error('Error updating shift:', error);
      // Rollback on error
      await loadData();
      throw error;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      // 1. Optimistic update
      const deletedShift = shifts.find(s => s.id === id);
      setShifts(prev => prev.filter(s => s.id !== id));

      // 2. Save to AsyncStorage + Supabase in parallel
      const updatedShifts = shifts.filter(s => s.id !== id);

      await Promise.allSettled([
        storageService.saveShifts(updatedShifts),
        databaseService.deleteShift(id),
      ]);
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
