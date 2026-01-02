import { create } from 'zustand';
import { supabase } from "@/lib/superbase";
import { MealType } from '@/types/food';

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
    // specifically for displaying logged enteries
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
    meal_type: MealType;
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
    fetchLogsForDate: (date: string) => Promise<void>;
    fetchSummaryForDate: (date: string) => Promise<void>;

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

const initialState: FoodLogState = {
    todaysLogs: [],
    todaysSummary: null,
    isLoading: false,
    error: null,
    lastFetchTime: 0,
    selectedDate: new Date().toISOString().split('T')[0],
};

// Stale request guards
let activeLogsRequestId: string | null = null;
let activeSummaryRequestId: string | null = null;

export const useFoodLogStore = create<FoodLogStore>((set, get) => ({
    ...initialState,

    fetchLogsForDate: async (date: string) => {
        const requestId = `${date}-${Date.now()}`;
        activeLogsRequestId = requestId;

        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('food_logs')
                .select(`
                    *,
                    food_item:food_items (
                        id,
                        name,
                        brand,
                        image_url
                    )
                `)
                .eq('date_logged', date)
                .order('consumed_at', { ascending: false });

            if (error) throw error;

            // Stale guard
            if (activeLogsRequestId !== requestId) {
                console.log('🔍 Stale logs request ignored for:', date);
                return;
            }

            set({
                todaysLogs: data || [],
                isLoading: false,
            });
        } catch (error) {
            if (activeLogsRequestId !== requestId) return;
            
            console.error('Error fetching logs for date:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch logs',
                isLoading: false,
            });
        }
    },

    fetchSummaryForDate: async (date: string) => {
        const requestId = `${date}-${Date.now()}`;
        activeSummaryRequestId = requestId;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                set({ error: 'Not authenticated' });
                return;
            }

            const { data, error } = await supabase
                .from('daily_nutrition_summary')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', date)
                .maybeSingle();

            if (error) throw error;

            // Stale guard
            if (activeSummaryRequestId !== requestId) {
                console.log('🔍 Stale summary request ignored for:', date);
                return;
            }

            set({ todaysSummary: data });
        } catch (error) {
            if (activeSummaryRequestId !== requestId) return;
            
            console.error('Error fetching summary for date:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch summary',
            });
        }
    },

    // ❌ DEPRECATED - use fetchLogsForDate instead
    fetchTodaysLogs: async () => {
        const today = new Date().toISOString().split('T')[0];
        await get().fetchLogsForDate(today);
    },

    // ❌ DEPRECATED - use fetchSummaryForDate instead
    fetchTodaysSummary: async () => {
        const today = new Date().toISOString().split('T')[0];
        await get().fetchSummaryForDate(today);
    },

    addLog: async (input: AddFoodLogInput) => {
        const { data: { user } } = await supabase.auth.getUser();
    
        if (!user) {
            console.error('No authenticated user');
            set({ error: 'Not authenticated', isLoading: false });
            return null;
        }

        const selectedDate = get().selectedDate;
        set({ isLoading: true, error: null });

        try {
            const logData = {
                user_id: user.id,
                food_item_id: input.food_item_id,
                meal_type: input.meal_type,
                servings: input.servings,
                serving_size_override: input.serving_size_override,
                serving_unit_override: input.serving_unit_override,
                calories: input.calories,
                protein_g: input.protein_g,
                carbs_g: input.carbs_g,
                fat_g: input.fat_g,
                fiber_g: input.fiber_g || 0,
                sugar_g: input.sugar_g || 0,
                sodium_mg: input.sodium_mg || 0,
                consumed_at: input.consumed_at || new Date().toISOString(),
                date_logged: selectedDate,
                notes: input.notes,
            };

            const { data, error } = await supabase
                .from('food_logs')
                .insert(logData)
                .select(`
                    *,
                    food_item:food_items (
                        id,
                        name,
                        brand,
                        image_url
                    )
                `)
                .single();

            if (error) throw error;

            // Only add to local state if still viewing the same date
            const currentDate = get().selectedDate;
            if (logData.date_logged === currentDate) {
                set({
                    todaysLogs: [data, ...get().todaysLogs],
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }

            // Fetch summary for the date we added to
            await get().fetchSummaryForDate(logData.date_logged);

            return data;
        } catch (error) {
            console.error('Error adding log:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to add log',
                isLoading: false,
            });
            return null;
        }
    },

    updateLog: async (id: string, updates: Partial<AddFoodLogInput>) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('food_logs')
                .update(updates)
                .eq('id', id)
                .select(`
                    *,
                    food_item:food_items (
                        id,
                        name,
                        brand,
                        image_url
                    )
                `)
                .single();

            if (error) throw error;

            // Update the log in the array
            set({
                todaysLogs: get().todaysLogs.map((log) =>
                    log.id === id ? data : log
                ),
                isLoading: false,
            });

            // Refetch summary for current date
            await get().fetchSummaryForDate(get().selectedDate);
        } catch (error) {
            console.error('Error updating log:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to update log',
                isLoading: false,
            });
        }
    },

    deleteLog: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('food_logs')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remove from state
            set({
                todaysLogs: get().todaysLogs.filter((log) => log.id !== id),
                isLoading: false,
            });

            // Refetch summary for current date
            await get().fetchSummaryForDate(get().selectedDate);
        } catch (error) {
            console.error('Error deleting log:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to delete log',
                isLoading: false,
            });
        }
    },

    // PURE - no side effects
    setSelectedDate: (date: string) => {
        set({ selectedDate: date });
    },

    clearError: () => {
        set({ error: null });
    },

    reset: () => {
        set(initialState);
    },
}));