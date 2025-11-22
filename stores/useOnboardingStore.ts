import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingData, OnboardingStore } from "@/types/onboarding";

const initialData: OnboardingData = {
  goal: '',
  activityLevel: '',
  dietaryPreferences: [],
  age: '',
  gender: '',
  weight: '',
  height: '',
  targetWeight: '',
  timeframe: '',
};

const validateStep = (step: number, data: OnboardingData): Record<string, string> => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 0: // Goal step
      if (!data.goal) {
        errors.goal = 'Please select a goal';
      }
      break;

    case 1: // Activity step
      if (!data.activityLevel) {
        errors.activityLevel = 'Please select your activity level';
      }
      break;

    case 2: // Dietary step (optional - no validation needed)
      break;

    case 3: // Personal info
      const age = parseInt(data.age);
      if (!data.age || isNaN(age) || age < 13 || age > 120) {
        errors.age = 'Please enter a valid age (13-120)';
      }

      if (!data.gender) {
        errors.gender = 'Please select your gender';
      }

      const weight = parseFloat(data.weight);
      if (!data.weight || isNaN(weight) || weight < 30 || weight > 500) {
        errors.weight = 'Please enter a valid weight (30-500 kg)';
      }

      const height = parseFloat(data.height);
      if (!data.height || isNaN(height) || height < 100 || height > 250) {
        errors.height = 'Please enter a valid height (100-250 cm)';
      }
      break;

    case 4: // Target step
      const targetWeight = parseFloat(data.targetWeight);
      if (!data.targetWeight || isNaN(targetWeight) || targetWeight < 30 || targetWeight > 500) {
        errors.targetWeight = 'Please enter a valid target weight (30-500 kg)';
      }

      if (!data.timeframe) {
        errors.timeframe = 'Please select a timeframe';
      }
      break;
  }

  return errors;
};

