import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Target, Activity, TrendingUp, Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

import { hexToRgba } from '@/constants/Colors';

const goals = [
    { id: 'lose' as const, label: 'Lose Weight', icon: TrendingUp, desc: 'Sustainable fat loss' },
    { id: 'maintain' as const, label: 'Maintain', icon: Target, desc: 'Stay at current weight' },
    { id: 'gain' as const, label: 'Gain Muscle', icon: Activity, desc: 'Build lean mass' },
];

export const GoalStep = () => {
    const { data, setField, errors } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const backgroundColor = useThemeColor({}, 'background');
    const errorColor = useThemeColor({}, 'error');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    What's your goal?
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    We'll personalize your plan
                </ThemedText>
            </View>

            {/* Goal Options */}
            <View style={styles.options}>
                {goals.map(({ id, label, icon: Icon, desc }) => {
                    const isSelected = data.goal === id;

                    // Pre-compute colors for better Android performance
                    const optionBorderColor = isSelected ? primaryColor : borderColor;
                    const optionBackgroundColor = isSelected ? hexToRgba(primaryColor, 0.2) : backgroundColor;
                    const iconColor = isSelected ? primaryColor : '#9CA3AF';

                    return (
                        <TouchableOpacity
                            key={id}
                            activeOpacity={0.7}
                            style={[
                                styles.option,
                                {
                                    borderColor: optionBorderColor,
                                    backgroundColor: optionBackgroundColor,
                                },
                            ]}
                            onPress={() => setField('goal', id)}
                        >
                            <Icon size={28} color={iconColor} />
                            <View style={styles.optionText}>
                                <ThemedText style={styles.optionLabel}>{label}</ThemedText>
                                <ThemedText style={styles.optionDesc}>{desc}</ThemedText>
                            </View>
                            {isSelected && <Check size={24} color={primaryColor} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Error Message */}
            {errors.goal && (
                <ThemedText style={[styles.error, { color: errorColor }]}>{errors.goal}</ThemedText>
            )}

            {/* Debug Info (Temporary) */}
            {/* <ThemedText style={{textAlign: 'center', marginTop: 20, color: 'gray'}}>
                Current Goal: {data.goal || 'None'}
            </ThemedText> */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        opacity: 0.7,
        textAlign: 'center',
    },
    options: {
        gap: 16,
        marginBottom: 24,
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
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
});
