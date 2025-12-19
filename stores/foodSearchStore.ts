import  { create } from 'zustand';
import  { supabase} from "@/lib/superbase";
import { FoodSearchResult, MealType, ServingSelection, FoodItem } from '@/types/food';

interface FoodSearchState {
    query: string;
    results: FoodSearchResult[];
    isLoading: boolean;
    error: string | null;

    SetQuery: (query: string) => void;
    search: (query: string ) => Promise<void>;
    clearSearch: () => void;
}

const initialState = {
    query: '',
    results: [],
    isLoading: false,
    error: null,
}