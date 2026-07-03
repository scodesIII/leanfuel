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
    fetchRecent: (days: number) => Promise<void>;
    addWeightLog: (weight: number, date?: string, note?: string) => Promise<void>;
    deleteWeightLog: (id: string) => Promise<void>;
    reset: () => void;
}

