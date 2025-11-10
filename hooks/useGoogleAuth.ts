import { useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

// Required for web browser authentication to complete properly
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Create redirect URI for OAuth callback
      const redirectUri = makeRedirectUri({
        scheme: 'com.tito.app',
      });

      // Initiate OAuth flow with Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Open browser for user to complete OAuth
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === 'success') {
          // Session will be automatically picked up by Supabase auth listener
          // in App.tsx via onAuthStateChange
          return;
        } else if (result.type === 'cancel') {
          Alert.alert('Cancelled', 'Google sign-in was cancelled');
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
};
