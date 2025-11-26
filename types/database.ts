/**
 * Database Response Types
 * Types for database function responses
 */

import { UserProfile } from '@/stores/userStore';

/**
 * Response from complete_onboarding() database function
 */
export interface CompleteOnboardingResponse {
    success: boolean;
    profile: UserProfile;
    calculations: {
        bmr: number;
        tdee: number;
        calorie_goal: number;
        protein_goal_g: number;
        carbs_goal_g: number;
        fat_goal_g: number;
        protein_percentage: number;
        fat_percentage: number;
        carbs_percentage: number;
        protein_multiplier: number;
        weight_used_for_protein: number;
    };
}

/**
 * Response from calculate_tdee() database function
 */
export interface TDEECalculationResponse {
    bmr: number;
    tdee: number;
    activity_multiplier: number;
}

/**
 * Response from calculate_macro_goals() database function
 */
export interface MacroGoalsResponse {
    calorie_goal: number;
    protein_goal_g: number;
    carbs_goal_g: number;
    fat_goal_g: number;
    protein_multiplier: number;
    fat_multiplier: number;
    weight_used_for_protein: number;
    protein_percentage: number;
    fat_percentage: number;
    carbs_percentage: number;
}

/**
 * Weight log entry
 */
export interface WeightLog {
    id: string;
    user_id: string;
    weight: number;
    date: string;
    notes: string | null;
    created_at: string;
}
