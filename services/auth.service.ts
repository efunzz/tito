/**
 * Authentication Service
 * Centralizes all Supabase authentication operations
 * Following D.R.Y. principle - single source of truth for auth
 */

import { supabase } from '../lib/supabase';
import type { User } from '../constants/types';

export const authService = {
  /**
   * Get the current authenticated user
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error };
      }

      return { user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { session: null, user: null, error };
      }

      return {
        session: data.session,
        user: data.user,
        error: null
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return { session: null, user: null, error };
    }
  },

  /**
   * Sign up with email, password, and optional metadata
   */
  signUp: async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // Store user metadata like name
        },
      });

      if (error) {
        return { session: null, user: null, error };
      }

      return {
        session: data.session,
        user: data.user,
        error: null
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { session: null, user: null, error };
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  },

  /**
   * Sign in with OAuth provider (Google, Apple, Facebook)
   */
  signInWithOAuth: async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, data, error: null };
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      return { success: false, error };
    }
  },

  /**
   * Get user session
   */
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return { session: null, error };
      }

      return { session, error: null };
    } catch (error) {
      console.error('Error getting session:', error);
      return { session: null, error };
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
};
