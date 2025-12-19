import { create } from 'zustand';
import { supabase } from "@/lib/superbase";
import { FoodSearchResult } from '@/types/food';

interface FoodSearchState {
    query: string;
    results: FoodSearchResult[];
    isSearching: boolean;
    error: string | null;

    setQuery: (query: string) => void;
    search: (query: string) => Promise<void>;
    clearSearch: () => void;
}

const initialState = {
    query: '',
    results: [],
    isSearching: false,
    error: null,
}



export const useFoodSearchStore = create<FoodSearchState>((set, get) => ({
    ...initialState,

    setQuery: (query: string) => set({ query }),

    search: async (query: string) => {
        const trimmed = query?.trim() ?? '';

        set({ query: trimmed });

        if (trimmed.length < 2) {
            set({ results: [], isSearching: false, error: null });
            return;
        }

        set({ isSearching: true, error: null });


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
                

            if (error) {
                throw error;
            }

            if (get().query !== trimmed) {
                return; // Ignore stale response
            }

            set({
                results: data as FoodSearchResult[] || [],
                isSearching: false,
            });

        } catch (error) {
            // Only update error if query hasn't changed
            if (get().query === trimmed) {
                set({
                    error: error instanceof Error ? error.message : 'Search failed',
                    isSearching: false,
                    results: []
                });
            }
        }


    },

    clearSearch: () => {
        set(initialState);
    }

}));