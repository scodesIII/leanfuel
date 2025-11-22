import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, Check, Target, Activity, Utensils, User, Calendar } from 'lucide-react-native';
import { GoalStep } from '@/components/onboarding/steps/GoalStep';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export const OnboardingFlow = () => {
    const { currentStep, nextStep, prevStep, goToStep } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');

    const steps = [
        { title: 'Goal', component: GoalStep, icon: Target },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.maxWidth}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        Lean<ThemedText type='title' style={{ color: primaryColor }}>Fuel</ThemedText>
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Your personalized nutrition journey
                    </ThemedText>
                </View>

                {/* Current Step */}
                <GoalStep />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    maxWidth: {
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    subtitle: {
        marginTop: 8,
        opacity: 0.7,
    },
});
