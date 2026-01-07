import { create } from 'zustand';
import { supabase } from "@/lib/superbase";
import { MealType } from '@/types/food';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes


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

type DateKey = string; // YYYY-MM-DD

interface CachedDay {
    logs: FoodLog[];
    summary: DailyNutritionSummary | null;
    fetchedAt: number;        // timestamp (ms)
    isFetching: boolean;      // per-date fetch guard
    error: string | null;     // per-date error
}


/**
 * State is like the "memory" of your app
 * Ask yourself: What data needs to be accessible across multiple screens?
 */

interface FoodLogState {
    // NEW CACHE STRUCTURE
    // ------------------
    selectedDate: DateKey;
    days: Record<DateKey, CachedDay>;

    // BACKWARD COMPATIBILITY (temporary)
    // ---------------------------------
    todaysLogs: FoodLog[];
    todaysSummary: DailyNutritionSummary | null;

    // GLOBAL UI STATE (temporary)
    isLoading: boolean;
    error: string | null;
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
    selectedDate: new Date().toISOString().split('T')[0],
    days: {},

    // Backward compatibility
    todaysLogs: [],
    todaysSummary: null,
    isLoading: false,
    error: null,
};


const now = () => Date.now();

function getCachedDay(
    days: Record<string, CachedDay>,
    date: string
): CachedDay | undefined {
    return days[date];
}

function isCacheValid(day: CachedDay | undefined): boolean {
    if (!day) return false;
    return now() - day.fetchedAt < CACHE_TTL;
}

function invalidateDate(
    days: Record<string, CachedDay>,
    date: string
): Record<string, CachedDay> {
    const copy = { ...days };
    delete copy[date];
    return copy;
}


// Stale request guards
let activeLogsRequestId: string | null = null;
let activeSummaryRequestId: string | null = null;

export const useFoodLogStore = create<FoodLogStore>((set, get) => ({
    ...initialState,

    fetchLogsForDate: async (date: string) => {
        const { days } = get();
        const cachedDay = getCachedDay(days, date);

        // 1️⃣ Serve cache if valid
        if (isCacheValid(cachedDay)) {
            set({
                todaysLogs: cachedDay?.logs || [],
                isLoading: false,
            });
            return;
        }

        // 2️⃣ Prevent duplicate fetches for same date
        if (cachedDay?.isFetching) {
            return;
        }

        const requestId = `${date}-${Date.now()}`;
        activeLogsRequestId = requestId;

        // 3️⃣ Mark date as fetching
        set(state => ({
            isLoading: true,
            error: null,
            days: {
                ...state.days,
                [date]: {
                    logs: cachedDay?.logs ?? [],
                    summary: cachedDay?.summary ?? null,
                    fetchedAt: cachedDay?.fetchedAt ?? 0,
                    isFetching: true,
                    error: null,
                },
            },
        }));

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

            // 4️⃣ Stale request guard
            if (activeLogsRequestId !== requestId) return;

            set(state => ({
                isLoading: false,
                todaysLogs: data || [],
                days: {
                    ...state.days,
                    [date]: {
                        logs: data || [],
                        summary: state.days[date]?.summary ?? null,
                        fetchedAt: now(),
                        isFetching: false,
                        error: null,
                    },
                },
            }));
        } catch (err) {
            if (activeLogsRequestId !== requestId) return;

            const message = err instanceof Error ? err.message : 'Failed to fetch logs';

            set(state => ({
                isLoading: false,
                error: message,
                days: {
                    ...state.days,
                    [date]: {
                        logs: state.days[date]?.logs ?? [],
                        summary: state.days[date]?.summary ?? null,
                        fetchedAt: 0,
                        isFetching: false,
                        error: message,
                    },
                },
            }));
        }   
    },

    fetchSummaryForDate: async (date: string) => {
        const { days } = get();
        const cachedDay = days[date];

        // 1️⃣ Serve cache if valid
        if (cachedDay && isCacheValid(cachedDay)) {
            return;
        }

        // 2️⃣ Prevent duplicate fetches
        if (cachedDay?.isFetching) {
            return;
        }

        const requestId = `${date}-summary-${Date.now()}`;
        activeSummaryRequestId = requestId;

        set(state => ({
            days: {
                ...state.days,
                [date]: {
                    logs: cachedDay?.logs ?? [],
                    summary: cachedDay?.summary ?? null,
                    fetchedAt: cachedDay?.fetchedAt ?? 0,
                    isFetching: true,
                    error: null,
                },
            },
        }));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('daily_nutrition_summary')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', date)
                .maybeSingle();

            if (error) throw error;
            if (activeSummaryRequestId !== requestId) return;

            set(state => ({
                days: {
                    ...state.days,
                    [date]: {
                        logs: state.days[date]?.logs ?? [],
                        summary: data ?? null,
                        fetchedAt: now(),
                        isFetching: false,
                        error: null,
                    },
                },
            }));
        } catch (err) {
            if (activeSummaryRequestId !== requestId) return;

            set(state => ({
                days: {
                    ...state.days,
                    [date]: {
                        logs: state.days[date]?.logs ?? [],
                        summary: null,
                        fetchedAt: 0,
                        isFetching: false,
                        error:
                            err instanceof Error
                                ? err.message
                                : 'Failed to fetch summary',
                    },
                },
            }));
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
        const { selectedDate } = get();
    
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set(state => ({
                days: {
                    ...state.days,
                    [selectedDate]: {
                        ...state.days[selectedDate],
                        error: 'Not authenticated',
                    },
                },
            }));
            return null;
        }

        try {
            const logData = {
                user_id: user.id,
                date_logged: selectedDate,
                consumed_at: input.consumed_at ?? new Date().toISOString(),
                ...input,
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

            // 🔥 Invalidate cache for that date
            set(state => ({
                days: invalidateDate(state.days, selectedDate),
            }));

            // 🔄 Refetch
            await get().fetchLogsForDate(selectedDate);
            await get().fetchSummaryForDate(selectedDate);

            return data;
        } catch (err) {
            set(state => ({
                days: {
                    ...state.days,
                    [selectedDate]: {
                        ...state.days[selectedDate],
                        error:
                            err instanceof Error
                                ? err.message
                                : 'Failed to add log',
                    },
                },
            }));
            return null;
        }
    },

    updateLog: async (id: string, updates: Partial<AddFoodLogInput>) => {
        const { selectedDate } = get();

        try {
            const { error } = await supabase
                .from('food_logs')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                days: invalidateDate(state.days, selectedDate),
            }));

            await get().fetchLogsForDate(selectedDate);
            await get().fetchSummaryForDate(selectedDate);
        } catch (err) {
            set(state => ({
                days: {
                    ...state.days,
                    [selectedDate]: {
                        ...state.days[selectedDate],
                        error:
                            err instanceof Error
                                ? err.message
                                : 'Failed to update log',
                    },
                },
            }));
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