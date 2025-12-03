/**
 * Validation Utilities Tests
 * 
 * Testing all validation functions for onboarding data to ensure
 * data integrity and proper error messages
 */

import { validateOnboardingData, validateField } from '../validation';
import type { OnboardingData } from '@/types/onboarding';

// ============================================================================
// HELPER: Create valid onboarding data for testing
// ============================================================================

const createValidData = (): OnboardingData => ({
    goal: 'lose',
    activityLevel: 'moderate',
    age: '30',
    gender: 'male',
    weight: '80',
    height: '175',
    targetWeight: '70',
    timeframe: '6months',
    dietaryPreferences: [],
});

