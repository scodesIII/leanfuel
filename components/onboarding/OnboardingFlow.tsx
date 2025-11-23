import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Target, Activity, Utensils, User, Calendar, Check } from 'lucide-react-native';
import { GoalStep } from '@/components/onboarding/steps/GoalStep';
import { ActivityStep } from '@/components/onboarding/steps/ActivityStep';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const steps = [
    { title: 'Goal', component: GoalStep, icon: Target },
    { title: 'Activity', component: ActivityStep, icon: Activity },
    // Placeholders for future steps
    { title: 'Diet', component: () => <View><ThemedText>Diet Step (Coming Soon)</ThemedText></View>, icon: Utensils },
    { title: 'Info', component: () => <View><ThemedText>Info Step (Coming Soon)</ThemedText></View>, icon: User },
    { title: 'Target', component: () => <View><ThemedText>Target Step (Coming Soon)</ThemedText></View>, icon: Calendar },
    { title: 'Review', component: () => <View><ThemedText>Review Step (Coming Soon)</ThemedText></View>, icon: Check },
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
