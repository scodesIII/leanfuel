// src/stores/userStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/superbase';
import type { User } from '@supabase/supabase-js';
import { retryOperation } from '@/utils/errorHandling';

export interface UserProfile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
    full_name: string | null;
    daily_calorie_goal: number;
    protein_goal_g: number;
    carbs_goal_g: number;
    fat_goal_g: number;
    preferred_units: 'metric' | 'imperial';
    timezone: string;
    onboarding_completed: boolean;
    profile_completed: boolean;
    created_at: string;
    updated_at: string;
    last_login: string;
}

interface UserState {
    // Auth user (from Supabase Auth)
    user: User | null;

    // Profile data (from your profiles table)
    profile: UserProfile | null;

    // Loading states
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setProfile: (profile: UserProfile | null) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    updateLastLogin: () => Promise<void>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    profile: null,
    isLoading: false,
    isInitialized: false,

    setUser: (user) => set({ user }),

    setProfile: (profile) => set({ profile }),

    // Fetch profile from profiles table
    fetchProfile: async () => {
        const { user } = get();
        if (!user) {
            set({ profile: null });
            return;
        }

        set({ isLoading: true });

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profiles:', error);
                set({ profile: null });
                return;
            }

            set({ profile: data });
        } catch (error) {
            console.error('Error fetching profile:', error);
            set({ profile: null });
            return;
        } finally {
            set({ isLoading: false });
        }
    },


    // Update profile with retry logic for network errors
    updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });

        try {
            // Retry up to 3 times for network errors
            // This handles transient network failures automatically
            const result = await retryOperation(
                async () => {
                    const response = await supabase
                        .from('profiles')
                        .update(updates)
                        .eq('id', user.id)
                        .select()
                        .single();
                    return response;
                },
                { maxRetries: 3, retryDelay: 1000 }
            );

            if (result.error) {
                console.error('Error updating profile:', result.error);
                throw result.error; // Re-throw for caller to handle with user-friendly message
            }

            set({ profile: result.data });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error; // Re-throw so ReviewStep can show appropriate error message
        } finally {
            set({ isLoading: false });
        }
    },

    // Update last login timestamp
    updateLastLogin: async () => {
        const { user } = get();
        if (!user) return;

        try {
            await supabase.rpc('update_last_login');
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await supabase.auth.signOut();
            set({ user: null, profile: null });
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    },

    // Initialize auth state and set up listener
    initialize: async () => {
        set({ isLoading: true });

        try {
            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                set({ user: session.user });
                await get().fetchProfile();
                await get().updateLastLogin();
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                const user = session?.user ?? null;
                set({ user });

                if (user) {
                    await get().fetchProfile();

                    if (event === 'SIGNED_IN') {
                        await get().updateLastLogin();
                    }
                } else {
                    set({ profile: null });
                }
            });

            set({ isInitialized: true });
        } catch (error) {
            console.error('Error initializing auth:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));