// stores/weightStore.ts

import { create } from 'zustand';
import { supabase } from '@/lib/superbase';
import { retryOperation } from '@/utils/errorHandling';
import { addDays, dateToLocalString, normalizeDate } from '@/lib/date';
import { useUserStore } from './userStore';

export interface weightLog {
    id: string;
    user_id: string;
    weight: number;      // always kilograms; convert at the UI edge via preferred_units
    date: string;        // "YYYY-MM-DD"
    note: string | null;
    created_at: string;
}

interface WeightState {
    // Most-recent-first list of the currently fetched window
    logs: weightLog[];

    // loading / error state
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null; // timestamp of last successful fetch

    // Action methods
    fetchRecent: (days?: number) => Promise<void>;
    addWeightLog: (weight: number, date?: string, note?: string) => Promise<void>;
    deleteWeightLog: (id: string) => Promise<void>;
    reset: () => void;
}

export const useWeightStore = create<WeightState>((set, get) => ({
    logs: [],
    isLoading: false,
    error: null,
    lastFetched: null,

    // Fetch the trailing `days` window default(30) for the curent user
    // RLS already scopes to the authenticated user; the user_id filter is
    // explicit for clarity and index use (idx_weight_logs_user_date).
    fetchRecent: async (days = 30) => {
        const { user } = useUserStore.getState();
        if (!user) {
            set({ logs: [], error: null });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const cutoff = dateToLocalString(addDays(normalizeDate(new Date()), -days));

            const { data, error } = await supabase
                .from('weight_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', cutoff)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching weight logs:', error);
                set({ error: error.message });
                return;
            }

            set({ logs: data ?? [], lastFetched: Date.now() });

        } catch (error) {
            console.error('Error fetching weight logs:', error);
            set({ error: 'Failed to load weight history' });
        } finally {
            set({ isLoading: false });
        }
    },


    // Add or edit a day's weight. Server-side log_weight() atomically upserts
    // the log AND syncs profiles.current_weight in one transaction, so there is
    // no client-side split-brain. We then refetch the window and pull the
    // server-synced profile back into userStore.
    addWeightLog: async (weight: number, date?: string, note?: string) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
            const result = await retryOperation(
                async () =>
                    supabase.rpc('log_weight', {
                        p_weight: weight,
                        p_date: date ?? dateToLocalString(normalizeDate(new Date())),
                        p_notes: note ?? null,
                    }),
                { maxRetries: 3, retryDelay: 1000 }
            );

            if (result.error) {
                console.error('Error logging weight:', result.error);
                throw result.error;
            }

            await get().fetchRecent();
            await useUserStore.getState().fetchProfile(); // reflect synced current_weight

        } catch (error) {
            console.error('Error logging weight:', error);
            set({ error: 'Failed to save weight' });
            throw error; // let the modal surface a user-friendly message
        } finally {
            set({ isLoading: false });
        }
    },



    deleteWeightLog: async (id: string) => { },

    reset: () => set({ logs: [], isLoading: false, error: null, lastFetched: null }),


}));