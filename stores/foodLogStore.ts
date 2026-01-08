import { create } from 'zustand';
import { supabase } from "@/lib/superbase";
import { MealType } from '@/types/food';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// STEP 1: DEFINE TYPES (What data structures do we need)
// ============================================================================


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
    logsFetchedAt: number;
    summaryFetchedAt: number;
    isFetchingLogs: boolean;
    isFetchingSummary: boolean;
    error: string | null;
}


/**
 * State is like the "memory" of your app
 * Ask yourself: What data needs to be accessible across multiple screens?
 */

interface FoodLogState {
    selectedDate: string;
    days: Record<string, CachedDay>;
}


interface FoodLogActions {
    // RETRIEVAL ACTIONS (Read from database)
    // ----------------
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
    clearError: (date: string) => void;
    reset: () => void; // Clear all state (e.g., on logout)
}

// Combine state + actions into one type
type FoodLogStore = FoodLogState & FoodLogActions;

const initialState: FoodLogState = {
    selectedDate: new Date().toISOString().split('T')[0],
    days: {},
};


const now = () => Date.now();

function getCachedDay(
    days: Record<string, CachedDay>,
    date: string
): CachedDay | undefined {
    return days[date];
}

function isLogsCacheValid(day: CachedDay | undefined): boolean {
    if (!day) return false;
    return now() - day.logsFetchedAt < CACHE_TTL;
}

function isSummaryCacheValid(day: CachedDay | undefined): boolean {
    if (!day) return false;
    return now() - day.summaryFetchedAt < CACHE_TTL;
}

const invalidateDay = (
    days: Record<string, CachedDay>,
    date: string
) => ({
    ...days,
    [date]: {
        ...createEmptyDay(),
    },
});

    


// Stale request guards
// --- request guards (module scope) ---
const activeLogRequests = new Map<string, string>();
const activeSummaryRequests = new Map<string, string>();

const createEmptyDay = (): CachedDay => ({
    logs: [],
    summary: null,
    logsFetchedAt: 0,
    summaryFetchedAt: 0,
    isFetchingLogs: false,
    isFetchingSummary: false,
    error: null,
});

const ensureDay = (days: Record<string, CachedDay>, date: string) => {
    if (days[date]) return days;
    return { ...days, [date]: createEmptyDay() };
};


export const useFoodLogStore = create<FoodLogStore>((set, get) => ({
    ...initialState,

    fetchLogsForDate: async (date: string) => {
        const { days } = get();

        const daysWithEntry = ensureDay(days, date);
        const cachedDay = daysWithEntry[date];

        const requestId = `${date}-${Date.now()}`;
        activeLogRequests.set(date, requestId);

        // 1️⃣ Serve cache if valid
        if (isLogsCacheValid(cachedDay)) {
            return;
        }

        // 2️⃣ Prevent duplicate fetches for same date
        if (cachedDay?.isFetchingLogs) {
            return;
        }

        // 3️⃣ Mark date as fetching. (SAFE)
        set(state => {
            const days = ensureDay(state.days, date);

            return {
                days: {
                    ...days,
                    [date]: {
                        ...days[date],
                        isFetchingLogs: true,
                        error: null,
                    },
                },
            };
        });

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
            if (activeLogRequests.get(date) !== requestId) {
                return;
            }

            set(state => {
                const days = ensureDay(state.days, date);

                return {
                    days: {
                        ...days,
                        [date]: {
                            ...days[date],
                            logs: data ?? [],
                            logsFetchedAt: now(),
                            isFetchingLogs: false,
                            error: null,
                        },
                    },
                };
            });
        } catch (err) {
            if (activeLogRequests.get(date) !== requestId) return;

            const message = err instanceof Error ? err.message : 'Failed to fetch logs';

            set(state => {
                const days = ensureDay(state.days, date);

                return {
                    days: {
                        ...days,
                        [date]: {
                            ...days[date],
                            isFetchingLogs: false,
                            error: message,
                        },
                    },
                };
            });
        } finally {
            // Always cleanup this request
            if (activeLogRequests.get(date) === requestId) {
                activeLogRequests.delete(date);
            }
        }

    },

    fetchSummaryForDate: async (date: string) => {
        const { days } = get();
        const cachedDay = days[date];

        // 1️⃣ Serve cache if valid
        if (cachedDay && isSummaryCacheValid(cachedDay)) {
            return;
        }

        // 2️⃣ Prevent duplicate fetches
        if (cachedDay?.isFetchingSummary) {
            return;
        }

        const requestId = `${date}-summary-${Date.now()}`;
        activeSummaryRequests.set(date, requestId);

        set(state => ({
            days: {
                ...state.days,
                [date]: {
                    logs: cachedDay?.logs ?? [],
                    summary: cachedDay?.summary ?? null,
                    logsFetchedAt: cachedDay?.logsFetchedAt ?? 0,
                    summaryFetchedAt: cachedDay?.summaryFetchedAt ?? 0,
                    isFetchingLogs: cachedDay?.isFetchingLogs ?? false,
                    isFetchingSummary: true,
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
            if (activeSummaryRequests.get(date) !== requestId) return;

            set(state => ({
                days: {
                    ...state.days,
                    [date]: {
                        logs: state.days[date]?.logs ?? [],
                        summary: data ?? null,
                        logsFetchedAt: state.days[date]?.logsFetchedAt ?? 0,
                        summaryFetchedAt: now(),
                        isFetchingLogs: state.days[date]?.isFetchingLogs ?? false,
                        isFetchingSummary: false,
                        error: null,
                    },
                },
            }));
        } catch (err) {
            if (activeSummaryRequests.get(date) !== requestId) return;

            set(state => ({
                days: {
                    ...state.days,
                    [date]: {
                        logs: state.days[date]?.logs ?? [],
                        summary: null,
                        logsFetchedAt: 0,
                        summaryFetchedAt: 0,
                        isFetchingLogs: state.days[date]?.isFetchingLogs ?? false,
                        isFetchingSummary: false,
                        error:
                            err instanceof Error
                                ? err.message
                                : 'Failed to fetch summary',
                    },
                },
            }));
        } finally {
            if (activeSummaryRequests.get(date) === requestId) {
                activeSummaryRequests.delete(date);
            }
        }
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
        const { selectedDate } = get();

        try {
            const { error } = await supabase
                .from('food_logs')
                .delete()
                .eq('id', id);

            if (error) throw error;

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
                                : 'Failed to delete log',
                    },
                },
            }));
        }
    },


    // PURE - no side effects
    setSelectedDate: (date: string) => {
        set({ selectedDate: date });
    },

    clearError: (date: string) => {
        set(state => ({
            days: {
                ...state.days,
                [date]: {
                    ...state.days[date],
                    error: null,
                },
            },
        }));
    },

    reset: () => {
        set(initialState);
    },
}));