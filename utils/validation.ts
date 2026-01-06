/**
 * Data Validation Utilities
 * 
 * Provides validation functions for onboarding data to ensure data integrity
 * and prevent invalid or manipulated data from being stored in the database.
 */

import { OnboardingData } from '@/types/onboarding';

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

/**
 * Validates all onboarding data before saving to database
 * 
 * This is a security measure to prevent:
 * - Data manipulation via store
 * - Invalid data causing calculation errors
 * - Database constraint violations
 * 
 * @param data - The onboarding data to validate
 * @returns Validation result with errors if any
 * 
 * @example
 * const validation = validateOnboardingData(data);
 * if (!validation.isValid) {
 *   Alert.alert('Invalid Data', Object.values(validation.errors).join('\n'));
 *   return;
 * }
 */
export function validateOnboardingData(data: OnboardingData): ValidationResult {
    const errors: Record<string, string> = {};

    // ============================================================================
    // GOAL VALIDATION
    // ============================================================================
    if (!data.goal || !['lose', 'maintain', 'gain'].includes(data.goal)) {
        errors.goal = 'Please select a valid goal';
    }

    // ============================================================================
    // ACTIVITY LEVEL VALIDATION
    // ============================================================================
    const validActivityLevels = ['sedentary', 'light', 'moderate', 'very', 'extra'];
    if (!data.activityLevel || !validActivityLevels.includes(data.activityLevel)) {
        errors.activityLevel = 'Please select a valid activity level';
    }

    // ============================================================================
    // AGE VALIDATION
    // ============================================================================
    const age = parseInt(data.age);
    if (!data.age || isNaN(age)) {
        errors.age = 'Age is required';
    } else if (age < 13) {
        errors.age = 'You must be at least 13 years old';
    } else if (age > 120) {
        errors.age = 'Please enter a valid age';
    }

    // ============================================================================
    // GENDER VALIDATION
    // ============================================================================
    if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) {
        errors.gender = 'Please select a valid gender';
    }

    // ============================================================================
    // WEIGHT VALIDATION
    // ============================================================================
    const weight = parseFloat(data.weight);
    if (!data.weight || isNaN(weight)) {
        errors.weight = 'Weight is required';
    } else if (weight < 20) {
        errors.weight = 'Weight must be at least 20 kg';
    } else if (weight > 500) {
        errors.weight = 'Weight must be less than 500 kg';
    }

    // ============================================================================
    // HEIGHT VALIDATION
    // ============================================================================
    const height = parseFloat(data.height);
    if (!data.height || isNaN(height)) {
        errors.height = 'Height is required';
    } else if (height < 50) {
        errors.height = 'Height must be at least 50 cm';
    } else if (height > 300) {
        errors.height = 'Height must be less than 300 cm';
    }

    // ============================================================================
    // TARGET WEIGHT VALIDATION
    // ============================================================================
    const targetWeight = parseFloat(data.targetWeight);
    if (!data.targetWeight || isNaN(targetWeight)) {
        errors.targetWeight = 'Target weight is required';
    } else if (targetWeight < 20) {
        errors.targetWeight = 'Target weight must be at least 20 kg';
    } else if (targetWeight > 500) {
        errors.targetWeight = 'Target weight must be less than 500 kg';
    }

    // ============================================================================
    // TIMEFRAME VALIDATION
    // ============================================================================
    const validTimeframes = ['3months', '6months', '12months', 'flexible'];
    if (!data.timeframe || !validTimeframes.includes(data.timeframe)) {
        errors.timeframe = 'Please select a valid timeframe';
    }

    // ============================================================================
    // LOGICAL VALIDATION
    // ============================================================================
    // Check if goal matches weight change direction
    if (data.goal && data.weight && data.targetWeight && !isNaN(weight) && !isNaN(targetWeight)) {
        if (data.goal === 'lose' && targetWeight >= weight) {
            errors.targetWeight = 'Target weight should be less than current weight for weight loss';
        } else if (data.goal === 'gain' && targetWeight <= weight) {
            errors.targetWeight = 'Target weight should be more than current weight for weight gain';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validates a single field
 * 
 * Useful for real-time validation during input
 * 
 * @param field - The field name to validate
 * @param value - The field value
 * @param allData - All onboarding data (for cross-field validation)
 * @returns Error message if invalid, empty string if valid
 */
export function validateField(
    field: keyof OnboardingData,
    value: any,
    allData?: Partial<OnboardingData>
): string {
    const tempData: OnboardingData = {
        goal: '',
        activityLevel: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
        targetWeight: '',
        timeframe: '',
        dietaryPreferences: [],
        ...allData,
        [field]: value
    } as OnboardingData;

    const validation = validateOnboardingData(tempData);
    return validation.errors[field] || '';
}


// ============================================================================
// GENERIC VALIDATORS (Reusable)
// ============================================================================

/**
 * Check if value is within a numeric range
 */
export function isInRange(value: number, min: number, max: number, fieldName: string): string {
    if (typeof value !== 'number' || isNaN(value)) {
        return `${fieldName} must be a number`;
    }

    if (value < min || value > max) {
        return `${fieldName} must be between ${min} and ${max}`;
    }

    return '';
}

/**
 * Check if value is non-negative
 */
export function isNonNegative(value: number, fieldName: string): string {
    if (typeof value !== 'number' || isNaN(value)) {
        return `${fieldName} must be a number`;
    }

    if (value < 0) {
        return `${fieldName} must be non-negative`;
    }

    return '';
}

/**
 * Check if value is within a predefined set
 */
export function isOneOf<T>(value: T, allowed: T[], fieldName: string): string {
    if (!allowed.includes(value)) {
        return `${fieldName} must be one of ${allowed.join(', ')}`;
    }

    return '';
}


// ============================================================================
// FOOD LOG VALIDATION
// ============================================================================
export interface FoodLogInput {
    food_item_id: string;
    meal_type: string;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
}

export interface FoodLogValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}


/**
 * Validate food log input before saving
 */
export function validateFoodLogInput(input: FoodLogInput): FoodLogValidationResult {
    const errors: Record<string, string> = {};

    // Food item id
    if(!input.food_item_id || input.food_item_id.trim() === '') {
        errors.food_item_id = 'Food item is required';
    }

    // Meal type
    const mealTypeError = isOneOf(input.meal_type, ['breakfast', 'lunch', 'dinner', 'snack'], 'Meal type');
    if (mealTypeError) errors.meal_type = mealTypeError;

    // Servings (0.25 to 100)
    const servingsError = isInRange(input.servings, 0.25, 100, 'Servings');
    if (servingsError) errors.servings = servingsError;

    // Calories (0 to 10000)
    const caloriesError = isInRange(input.calories, 0, 10000, 'Calories');
    if (caloriesError) errors.calories = caloriesError;

    // Macros (non-negative)
    const proteinError = isNonNegative(input.protein_g, 'Protein');
    if (proteinError) errors.protein_g = proteinError;

    const carbsError = isNonNegative(input.carbs_g, 'Carbs');
    if (carbsError) errors.carbs_g = carbsError;

    const fatError = isNonNegative(input.fat_g, 'Fat');
    if (fatError) errors.fat_g = fatError;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}


/**
 * Validates food log update (servings and meal type only)
 */
export function validateFoodLogUpdate(input: { servings: number; meal_type: string; }): FoodLogValidationResult {
    const errors: Record<string, string> = {};

    const servingsError = isInRange(input.servings, 0.25, 100, 'Servings');
    if (servingsError) errors.servings = servingsError;

    const mealTypeError = isOneOf(
        input.meal_type,
        ['breakfast', 'lunch', 'dinner', 'snack'],
        'Meal type'
    );
    if (mealTypeError) errors.meal_type = mealTypeError;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}


// ============================================================================
// SEARCH QUERY HANDLING
// ============================================================================

/**
 * Normalize a search query for consistency (NOT security)
 * 
 * Security is handled by:
 * - React (escapes output, prevents XSS)
 * - Supabase (parameterized queries, prevents SQL injection)
 */
export function normalizeSearchQuery(input: unknown): string {
    if (typeof input !== 'string') return '';

    return input
        .normalize('NFKC')      // Unicode normalization (handles é vs e + ´)
        .trim()                 // Remove leading/trailing whitespace
        .replace(/\s+/g, ' ')   // Collapse multiple spaces to single
        .slice(0, 100);         // Reasonable length limit
}