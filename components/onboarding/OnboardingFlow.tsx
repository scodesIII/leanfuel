import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Target, Activity, Utensils, User, Calendar, Check } from 'lucide-react-native';
import { GoalStep } from '@/components/onboarding/steps/GoalStep';
import { ActivityStep } from '@/components/onboarding/steps/ActivityStep';
import { PersonalInfoStep } from '@/components/onboarding/steps/PersonalInfoStep';
import { TargetStep } from '@/components/onboarding/steps/TargetStep';
import { ReviewStep } from '@/components/onboarding/steps/ReviewStep';
// import { DietaryStep } from '@/components/onboarding/steps/DietaryStep'; // Disabled for now - calorie tracking focus
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const steps = [
    { title: 'Goal', component: GoalStep, icon: Target },
    { title: 'Activity', component: ActivityStep, icon: Activity },
    // { title: 'Diet', component: DietaryStep, icon: Utensils }, // Disabled - will add when diet plans are implemented
    { title: 'Info', component: PersonalInfoStep, icon: User },
    { title: 'Target', component: TargetStep, icon: Calendar },
    { title: 'Review', component: ReviewStep, icon: Check },
];

export const OnboardingFlow = () => {
    const { currentStep, nextStep, prevStep, goToStep } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');

    const CurrentStepComponent = steps[currentStep]?.component || steps[0].component;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* App Title */}
                <View style={styles.titleContainer}>
                    <ThemedText type="title" style={styles.title}>
                        Lean<ThemedText type='title' style={{ color: primaryColor }}>Fuel</ThemedText>
                    </ThemedText>
                </View>

                {/* Progress Bar */}
                <ProgressBar currentStep={currentStep} onStepPress={goToStep} />
            </View>

            {/* Step Content */}
            <View style={styles.contentContainer}>
                <CurrentStepComponent />
            </View>

            {/* Navigation Buttons */}
            <NavigationButtons
                currentStep={currentStep}
                totalSteps={steps.length}
                onBack={prevStep}
                onNext={nextStep}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
    },
});
