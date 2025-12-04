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


    // ==========================================================================
    // GOAL VALIDATION
    // ==========================================================================

    describe('Goal Validation', () => {
        it('should reject empty goal', () => {
            const data = createValidData();
            data.goal = '';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.goal).toBe('Please select a valid goal');
        });

        it('should reject invalid goal', () => {
            const data = createValidData();
            data.goal = 'invalid' as any;

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.goal).toBe('Please select a valid goal');
        });

        it('should accept "lose" as valid goal', () => {
            const data = createValidData();
            data.goal = 'lose';

            const result = validateOnboardingData(data);
            expect(result.errors.goal).toBeUndefined();
        });

        it('should accept "maintain" as valid goal', () => {
            const data = createValidData();
            data.goal = 'maintain';

            const result = validateOnboardingData(data);
            expect(result.errors.goal).toBeUndefined();
        });

        it('should accept "gain" as valid goal', () => {
            const data = createValidData();
            data.goal = 'gain';

            const result = validateOnboardingData(data);
            expect(result.errors.goal).toBeUndefined();
        });
    });

    
    // ==========================================================================
    // ACTIVITY LEVEL VALIDATION
    // ==========================================================================

    describe('Activity Level Validation', () => {
        it('should reject empty activity level', () => {
            const data = createValidData();
            data.activityLevel = '';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.activityLevel).toBe('Please select a valid activity level');
        });

        it('should reject invalid activity level', () => {
            const data = createValidData();
            data.activityLevel = 'invalid' as any;

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.activityLevel).toBe('Please select a valid activity level');
        });

        const validActivityLevels = ['sedentary', 'light', 'moderate', 'very', 'extra'];
        validActivityLevels.forEach((level) => {
            it(`should accept "${level}" as valid activity level`, () => {
                const data = createValidData();
                data.activityLevel = level as any;

                const result = validateOnboardingData(data);
                expect(result.errors.activityLevel).toBeUndefined();
            });
        });
    });

    
    // ==========================================================================
    // AGE VALIDATION
    // ==========================================================================

    describe('Age Validation', () => {
        it('should reject empty age', () => {
            const data = createValidData();
            data.age = '';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.age).toBe('Age is required');
        });

        it('should reject non-numeric age', () => {
            const data = createValidData();
            data.age = 'abc';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.age).toBe('Age is required');
        });

        it('should reject age below 13', () => {
            const data = createValidData();
            data.age = '12';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.age).toBe('You must be at least 13 years old');
        });

        it('should accept age of 13 (boundary)', () => {
            const data = createValidData();
            data.age = '13';

            const result = validateOnboardingData(data);
            expect(result.errors.age).toBeUndefined();
        });

        it('should accept age of 120 (boundary)', () => {
            const data = createValidData();
            data.age = '120';

            const result = validateOnboardingData(data);
            expect(result.errors.age).toBeUndefined();
        });

        it('should reject age above 120', () => {
            const data = createValidData();
            data.age = '121';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.age).toBe('Please enter a valid age');
        });

        it('should accept valid age in middle range', () => {
            const data = createValidData();
            data.age = '30';

            const result = validateOnboardingData(data);
            expect(result.errors.age).toBeUndefined();
        });
    });


    // ==========================================================================
    // GENDER VALIDATION
    // ==========================================================================

    describe('Gender Validation', () => {
        it('should reject empty gender', () => {
            const data = createValidData();
            data.gender = '';

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.gender).toBe('Please select a valid gender');
        });

        it('should reject invalid gender', () => {
            const data = createValidData();
            data.gender = 'invalid' as any;

            const result = validateOnboardingData(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.gender).toBe('Please select a valid gender');
        });

        it('should accept "male" as valid gender', () => {
            const data = createValidData();
            data.gender = 'male';

            const result = validateOnboardingData(data);
            expect(result.errors.gender).toBeUndefined();
        });

        it('should accept "female" as valid gender', () => {
            const data = createValidData();
            data.gender = 'female';

            const result = validateOnboardingData(data);
            expect(result.errors.gender).toBeUndefined();
        });

        it('should accept "other" as valid gender', () => {
            const data = createValidData();
            data.gender = 'other';

            const result = validateOnboardingData(data);
            expect(result.errors.gender).toBeUndefined();
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
