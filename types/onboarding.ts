

export interface OnboardingData {
    goal: 'lose' | 'maintain' | 'gain' | '';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra' | '';
    dietaryPreferences: string[];
    age: string;
    gender: 'male' | 'female' | '';
    weight: string;
    height: string;
    targetWeight: string;
    timeframe: '3months' | '6months' | '12months' | 'flexible' | '';
}


export interface OnboardingState {
    currentStep: number;
    data: OnboardingData;
    errors: Partial<Record<keyof OnboardingData, string>>;
    isComplete: boolean;
}

export interface OnboardingActions {
    setField: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
    setError: (field: keyof OnboardingData, message: string) => void;
    clearError: (field: keyof OnboardingData) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    validateStep: (step: number) => boolean;
    reset: () => void;
    complete: () => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;