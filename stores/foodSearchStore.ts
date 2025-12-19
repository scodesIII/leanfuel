import { create } from 'zustand';
import { supabase } from "@/lib/superbase";
import { FoodSearchResult } from '@/types/food';

interface FoodSearchStateData {
    query: string;
    results: FoodSearchResult[];
    isSearching: boolean;
    error: string | null;
}

interface FoodSearchState extends FoodSearchStateData {
    setQuery: (query: string) => void;
    search: (query: string) => Promise<void>;
    clearSearch: () => void;
}

const initialState: FoodSearchStateData = {
    query: '',
    results: [],
    isSearching: false,
    error: null,
};

let currentAbortController: AbortController | null = null;

export const useFoodSearchStore = create<FoodSearchState>((set, get) => ({
    ...initialState,

    setQuery: (query: string) => set({ query }),

    search: async (query: string) => {
        const trimmed = query?.trim() ?? '';
        set({ query: trimmed });

        if (trimmed.length < 2) {
            currentAbortController?.abort();
            currentAbortController = null;
            set({ results: [], isSearching: false, error: null });
            return;
        }

        set({ results: [], isSearching: true, error: null });

        // Abort previous request if still in flight
        if (currentAbortController) {
            currentAbortController.abort();
        }

        // Create new controller for this request
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;


        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            const orFilter = userId
                ? `is_public.eq.true,created_by.eq.${userId}`
                : 'is_public.eq.true';

            const { data, error } = await supabase
                .from('food_items')
                .select('id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit, is_verified')
                .or(orFilter)
                .ilike('name', `%${trimmed}%`)
                .is('deleted_at', null)
                .order('usage_count', { ascending: false })
                .limit(20)
                .abortSignal(signal);
                

            if (error) {
                throw error;
            }

            // Only update if this controller is still current
            // (handles race condition where abort happened between request and response)
            if (signal.aborted) return;

            if (get().query !== trimmed) {
                return; // Ignore stale response
            }

            set({
                results: (data as FoodSearchResult[]) || [],
                isSearching: false,
            });

        } catch (error) {
            // Check if this was an abort error (not a real error)
            if (error instanceof Error && error.name === 'AbortError') {
                // Request was cancelled intentionally, do nothing
                return;
            }

            if (!signal.aborted) {
                set({
                    error: error instanceof Error ? error.message : 'Search failed',
                    isSearching: false,
                    results: []
                });
            }
        }


    },

    clearSearch: () => {
        // Abort any in-flight request
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }

        set(initialState);
    }

}));