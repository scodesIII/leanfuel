import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
// import { processLock } from '@supabase/supabase-js'
import Constants from 'expo-constants';


// Type-safe way to access environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey ?? '';

// Check if they exist
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // lock: processLock,
  },
  //   realtime: {
  //   transport: 'websocket',
  //   timeout: 20000,
  // },
  // global: {
  //   headers: {
  //     'X-Client-Info': 'supabase-js-react-native',
  //   },
  // },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})