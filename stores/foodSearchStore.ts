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
      // Ranking, typo tolerance and visibility (RLS) are handled in the RPC
      const { data, error } = await supabase
        .rpc('search_food_items', { search_query: trimmed, limit_count: 20 })
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
