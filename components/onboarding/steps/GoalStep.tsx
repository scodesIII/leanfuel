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

                    // FIX: Pre-compute colors outside of style array to ensure React Native
                    // properly detects changes and re-renders on Android
                    const optionBorderColor = isSelected ? primaryColor : borderColor;
                    const optionBackgroundColor = isSelected ? hexToRgba(primaryColor, 0.2) : 'transparent';
                    const iconColor = isSelected ? primaryColor : '#9CA3AF';

                    return (
                        <TouchableOpacity
                            // FIX: Include isSelected in key to force component remount when selection changes.
                            // This works around an Android rendering bug where background colors don't update
                            // properly with inline dynamic styles. By changing the key, React treats it as a
                            // new component and forces a full re-render, ensuring the background color is painted.
                            key={`${id}-${isSelected}`}
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
                <ThemedText style={styles.error}>{errors.goal}</ThemedText>
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
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
});
