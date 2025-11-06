import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://grjzsovsikcdjivkqnpa.supabase.co'
const supabasePublishableKey = 'sb_publishable_tFtbg-9vxvCgnNzXVp6xZw_1BUoeceg'
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})