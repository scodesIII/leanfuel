// stores/weightStore.ts

import { create } from 'zustand';
import { supabase } from '@/lib/superbase';
import { dateToLocalString, normalizeDate } from '@/lib/date';
import { useUserStore } from './userStore';

export interface WeightLog {
    id: string;
    user_id: string;
    weight: number;      // always kilograms; convert at the UI edge via preferred_units
    date: string;        // "YYYY-MM-DD"
    notes: string | null;
    created_at: string;
}

interface WeightState {
    // Most-recent-first list of the currently fetched window
    latest: WeightLog[] | null;

    // loading / error state
    isLoading: boolean;
    lastFetched: number | null; // timestamp of last successful fetch
    saveError: string | null; 
    loadError: string | null; 

    // Action methods
    fetchLatest: (days?: number) => Promise<void>;
    addWeightLog: (weight: number, date?: string, notes?: string) => Promise<void>;
    deleteWeightLog: (id: string) => Promise<void>;
    reset: () => void;
}

export const useWeightStore = create<WeightState>((set, get) => ({
    latest: [],
    isLoading: false,
    saveError: null,
    loadError: null,
    lastFetched: null,

    // Fetch the trailing `days` window default(30) for the current user
    // RLS already scopes to the authenticated user; the user_id filter is
    // explicit for clarity and index use (idx_weight_logs_user_date).
    fetchLatest: async (days = 30) => {
        const { user } = useUserStore.getState();
        if (!user) {
            set({ loadError: 'Failed to load weight history' });
            return;
        }

        set({ isLoading: true, loadError: null });

        try {
            // const cutoff = dateToLocalString(addDays(normalizeDate(new Date()), -days));

            const { data, error } = await supabase
                .from('weight_logs')
                .select('*')
                .eq('user_id', user.id)
                // .gte('date', cutoff)
                .order('date', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Error fetching weight logs:', error);
                set({ loadError: 'Failed to load weight history' });
                return;
            }

            set({ latest: data ?? [], lastFetched: Date.now() });

        } catch (error) {
            console.error('Error fetching weight logs:', error);
            set({ loadError: 'Failed to load weight history' });
        } finally {
            set({ isLoading: false });
        }
    },


    // Add or edit a day's weight. Server-side log_weight() atomically upserts
    // the log AND syncs profiles.current_weight in one transaction, so there is
    // no client-side split-brain. We then refetch the window and pull the
    // server-synced profile back into userStore.
    addWeightLog: async (weight: number, date?: string, notes?: string) => {
        const user = useUserStore.getState().user;
        
        if (!user) {
            throw new Error('User not authenticated');
        }


        set({ isLoading: true, saveError: null });

        try {
            const { error } = await supabase.rpc('log_weight', {
                p_weight: weight,
                p_date: date ?? dateToLocalString(normalizeDate(new Date())),
                p_notes: notes ?? null,
            });

            if (error) {
                console.error('Error logging weight:', error);
                throw error;
            }

            await Promise.allSettled([
                get().fetchLatest(),
                useUserStore.getState().fetchProfile(),
            ]);



        } catch (error) {
            console.error('Error logging weight:', error);
            set({ saveError: 'Failed to save weight' });
            throw error; // let the modal surface a user-friendly message
        } finally {
            set({ isLoading: false });
        }
    },


    // Delete a log. Server-side delete_weight_log() atomically removes the row
    // AND re-points profiles.current_weight at the newest remaining entry
    // (or clears it if none remain) in one transaction.
    deleteWeightLog: async (id: string) => {
        const user = useUserStore.getState().user;
        if (!user) {
            throw new Error('User not authenticated');
        }

        set({ isLoading: true, saveError: null });
        
        try {
            const { error } = await supabase.rpc('delete_weight_log', { p_id: id });

            if (error) {
                console.error('Error deleting weight log:', error);
                throw error;
            }

            await Promise.allSettled([
                get().fetchLatest(),
                useUserStore.getState().fetchProfile(),
            ]);


        } catch (error) {
            console.error('Error deleting weight log:', error);
            set({ saveError: 'Failed to delete weight entry' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () => set({ latest: null, isLoading: false, saveError: null, loadError: null, lastFetched: null }),


}));