import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, Activity, TrendingUp } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export const GoalStep = () => {
    const { data, setField, errors } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const goals = [
        { id: 'lose' as const, label: 'Lose Weight', icon: TrendingUp, desc: 'Sustainable fat loss' },
        { id: 'maintain' as const, label: 'Maintain', icon: Target, desc: 'Stay at current weight' },
        { id: 'gain' as const, label: 'Gain Muscle', icon: Activity, desc: 'Build lean mass' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    What's your goal?
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    We'll personalize your plan
                </ThemedText>
            </View>

            <View style={styles.optionsContainer}>
                {goals.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = data.goal === goal.id;

                    return (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.option,
                                { borderColor: isSelected ? primaryColor : borderColor },
                                isSelected && { backgroundColor: `${primaryColor}10` },
                            ]}
                            onPress={() => setField('goal', goal.id)}
                        >
                            <Icon
                                size={32}
                                color={isSelected ? primaryColor : '#94a3b8'}
                            />
                            <View style={styles.optionText}>
                                <ThemedText style={styles.optionLabel}>{goal.label}</ThemedText>
                                <ThemedText style={styles.optionDesc}>{goal.desc}</ThemedText>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {errors.goal && (
                <ThemedText style={styles.error}>{errors.goal}</ThemedText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        opacity: 0.7,
    },
    optionsContainer: {
        gap: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        gap: 16,
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionDesc: {
        fontSize: 14,
        opacity: 0.7,
    },
    error: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
    },
});