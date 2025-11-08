import  { create } from 'zustand';
import  { supabase} from "@/lib/superbase";

// ============================================================================
// STEP 1: DEFINE TYPES (What data structures do we need)
// ============================================================================


/**
 * Why define types first ?
 * - Typescript catches errors at compile time
 * - IDE autocomplete works perfectly
 * - Self-documenting code
 */

// Simgle food log entry (matches food_logs table in supabase db)
export interface FoodLog {
    id: string;
    user_id: string;
    food_item_id: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    serving_size_override?: number;
    serving_unit_override?: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
    consumed_at: string; // ISO timestamp
    date_logged: string; // YYYY-MM-DD
    notes?: string;
    created_at: string;
    updated_at: string;

    // Joined data from food_items table
    food_item?: {
        id: string;
        name: string;
        brand?: string;
        image_url?: string;
    }
}

// Daily summary (matches daily_nutrition_summary table in supabase db)
export interface DailyNutritionSummary {
    id: string;
    user_id: string;
    date: string; // YYYY-MM-DD

    // Total macros for the day
    total_calories: number;
    total_protein_g: number;
    total_carbs_g: number;
    total_fat_g: number;
    total_fiber_g: number;
    total_sugar_g: number;
    total_sodium_mg: number;

    // Meal calories breakdown
    breakfast_calories: number;
    lunch_calories: number;
    dinner_calories: number;
    snacks_calories: number;

    // Breakfast macros breakdown
    breakfast_protein_g: number;
    breakfast_carbs_g: number;
    breakfast_fat_g: number;

    // Lunch macros breakdown
    lunch_protein_g: number;
    lunch_carbs_g: number;
    lunch_fat_g: number;

    // Dinner macros breakdown
    dinner_protein_g: number;
    dinner_carbs_g: number;
    dinner_fat_g: number;

    // Snacks macros breakdown
    snacks_protein_g: number;
    snacks_carbs_g: number;
    snacks_fat_g: number;

    // Goals snapshot
    calorie_goal: number;
    protein_goal_g: number;
    carbs_goal_g: number;
    fat_goal_g: number;

    // Metadata
    entries_count: number;
    last_meal_time?: string;
    created_at: string;
    updated_at: string;
}


// Input type for adding a new log (subset of FoodLog)
export interface AddFoodLogInput {
    food_item_id: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    serving_size_override?: number;
    serving_unit_override?: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
    consumed_at?: string; // Optional, defaults to now
    notes?: string;
}



// ============================================================================
// STEP 2: DEFINE STATE SHAPE (What data lives in the store?)
// ============================================================================

/**
 * State is like the "memory" of your app
 * Ask yourself: What data needs to be accessible across multiple screens?
 */

interface FoodLogState {
    // DATA STATE
    // ----------
    todaysLogs: FoodLog[]; // All food logs for today
    todaysSummary: DailyNutritionSummary | null; // Pre-calculated totals

    // UI STATE
    // --------
    isLoading: boolean; // Show loading spinners
    error: string | null; // Show error messages

    // CACHE STATE (Optional but useful)
    // -----------
    lastFetchTime: number; // When did we last fetch? (for caching)
    selectedDate: string; // Which date are we viewing? (defaults to today)
}


interface FoodLogActions {
    // FETCH ACTIONS (Read from database)
    // -------------------
    fetchTodaysLogs: () => Promise<void>;
    fetchTodaysSummary: () => Promise<void>;
    fetchLogsForDate: () => Promise<void>;

    // MUTATION ACTIONS (Write to database)
    // ----------------
    addLog: (input: AddFoodLogInput) => Promise<FoodLog | null>;
    updateLog: (id: string, updates: Partial<AddFoodLogInput>) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;

    // UI ACTIONS (Update UI state only)
    // ----------
    setSelectedDate: (date: string) => void;
    clearError: () => void;
    reset: () => void; // Clear all state (e.g., on logout)
}

// Combine state + actions into one type
type FoodLogStore = FoodLogState & FoodLogActions;


// ============================================================================
// STEP 4: CREATE THE STORE (zustand)
// ============================================================================

const initialState: FoodLogState = {
    todaysLogs: [],
    todaysSummary: null,
    isLoading: false,
    error: null,
    lastFetchTime: 0,
    selectedDate: new Date().toISOString().split('T')[0], // Today's date
};


export const useFoodLogStore = create<FoodLogStore>((set, get) => ({
    ...initialState,

    fetchTodaysLogs: async () => {
        // Get current state to check if we need to refetch
        const state = get();
        const now = Date.now();
        const CACHE_DURATION = 30 * 1000; // 30 seconds

        // OPTIMIZATION: Skip fetch if data is fresh (caching)
        if(
            state.todaysLogs.length > 0 &&
            now - state.lastFetchTime < CACHE_DURATION
        ) {
            console.log('Using cached data')
            return;
        }

        // Step 1: Set loading state
        set({ isLoading: true, error: null });

        try {
            // Step 2: Fetch from Supabase
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('food_logs')
                .select(`
                    *,
                    food_item: food_items(
                        id,
                        name,
                        brand,
                        image_url
                        )
                `)
                .eq('date_logged', today)
                .order('consumed_at', { ascending: false });

            if (error) throw  error;
        }
    },
    fetchTodaysSummary: async () => {},
    fetchLogsForDate: async () => {},
    addLog: async (input: AddFoodLogInput) => {},
    updateLog: async (id: string, updates: Partial<AddFoodLogInput>) => {},
    deleteLog: async (id: string) => {},
});