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


// ============================================================================
// TESTING validateOnboardingData() - COMPLETE VALIDATION
// ============================================================================

describe('validateOnboardingData', () => {
    describe('Valid Data', () => {
        it('should validate completely valid data', () => {
            const data = createValidData();
            const result = validateOnboardingData(data);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual({});
        });

        it('should validate weight loss goal with correct target', () => {
            const data = createValidData();
            data.goal = 'lose';
            data.weight = '80';
            data.targetWeight = '70';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(true);
        });

        it('should validate weight gain goal with correct target', () => {
            const data = createValidData();
            data.goal = 'gain';
            data.weight = '70';
            data.targetWeight = '80';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(true);
        });

        it('should validate maintain goal with any target weight', () => {
            const data = createValidData();
            data.goal = 'maintain';
            data.weight = '75';
            data.targetWeight = '75';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(true);
        });
    });

    
});



// ============================================================================
// TESTING validateField() - SINGLE FIELD VALIDATION
// ============================================================================

describe('validateField', () => {
    it('should validate a single field - age valid', () => {
        const error = validateField('age', '25');
        expect(error).toBe('');
    });

    it('should validate a single field - age invalid', () => {
        const error = validateField('age', '10');
        expect(error).toBe('You must be at least 13 years old');
    });

    it('should validate weight field', () => {
        const error = validateField('weight', '75');
        expect(error).toBe('');
    });

    it('should return error for invalid weight', () => {
        const error = validateField('weight', '10');
        expect(error).toBe('Weight must be at least 20 kg');
    });

    it('should validate with cross-field data for logical validation', () => {
        const allData = {
            goal: 'lose' as const,
            weight: '80',
        };

        const error = validateField('targetWeight', '90', allData);
        expect(error).toBe('Target weight should be less than current weight for weight loss');
    });

    it('should return empty string for valid field with cross-field data', () => {
        const allData = {
            goal: 'lose' as const,
            weight: '80',
        };

        const error = validateField('targetWeight', '70', allData);
        expect(error).toBe('');
    });

    it('should validate goal field', () => {
        const error = validateField('goal', 'lose');
        expect(error).toBe('');
    });

    it('should return error for invalid goal', () => {
        const error = validateField('goal', 'invalid');
        expect(error).toBe('Please select a valid goal');
    });
});
