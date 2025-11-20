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

    // todo: implement validation


    return errors;  
}
