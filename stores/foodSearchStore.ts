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

// Global AbortController for current request
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
      // Keep previous results instead of clearing immediately
      set({ isSearching: false, error: null });
      return;
    }

    // Start searching; do not clear results yet
    set({ isSearching: true, error: null });

    // Abort previous request if still running
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // check if aborted during getUser()
      if (signal.aborted) return;

      const userId = user?.id;
      const orFilter = userId
        ? `is_public.eq.true,created_by.eq.${userId}`
        : 'is_public.eq.true';

      const { data, error } = await supabase
        .from('food_items')
        .select(
          'id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit, is_verified'
        )
        .or(orFilter)
        .ilike('name', `%${trimmed}%`)
        .is('deleted_at', null)
        .order('usage_count', { ascending: false })
        .limit(20)
        .abortSignal(signal);

      if (error) throw error;

      // Only update results if still relevant
      if (signal.aborted) return;
      if (get().query !== trimmed) return;

      set({
        results: (data as FoodSearchResult[]) || [],
        isSearching: false,
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;

      if (!signal.aborted) {
        set({
          error: error instanceof Error ? error.message : 'Search failed',
          isSearching: false,
          results: [], 
        });
      }
    }
  },

  clearSearch: () => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    set(initialState);
  },
}));
