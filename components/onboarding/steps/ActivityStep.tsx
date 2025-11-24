import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hexToRgba } from '@/constants/Colors';


export const ActivityStep = () => {
    const { data, setField, errors } = useOnboardingStore();

    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const backgroundColor = useThemeColor({}, 'background');
    const errorColor = useThemeColor({}, 'error');

    const levels = [
        { id: 'sedentary' as const, label: 'Sedentary', desc: 'Little/no exercise', multiplier: 1.2 },
        { id: 'light' as const, label: 'Light', desc: '1-3 days/week', multiplier: 1.375 },
        { id: 'moderate' as const, label: 'Moderate', desc: '3-5 days/week', multiplier: 1.55 },
        { id: 'very' as const, label: 'Very Active', desc: '6-7 days/week', multiplier: 1.725 },
        { id: 'extra' as const, label: 'Extra', desc: 'Physical job + exercise', multiplier: 1.9 },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    How active are you?
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    We'll personalize your plan
                </ThemedText>
            </View>

            <View style={styles.options}>
                {levels.map(({ id, label, desc, multiplier }) => {
                    const isSelected = data.activityLevel === id;

                    // Pre-compute colors for better Android performance
                    const optionBorderColor = isSelected ? primaryColor : borderColor;
                    const optionBackgroundColor = isSelected ? hexToRgba(primaryColor, 0.2) : backgroundColor;

                    return (
                        <TouchableOpacity
                            key={id}
                            activeOpacity={0.7}
                            onPress={() => setField('activityLevel', id)}
                            style={[
                                styles.option,
                                {
                                    borderColor: optionBorderColor,
                                    backgroundColor: optionBackgroundColor,
                                }
                            ]}
                        >
                            <View style={styles.optionContent}>
                                <View style={styles.optionTextContainer}>
                                    <View style={styles.labelRow}>
                                        <ThemedText style={styles.label}>{label}</ThemedText>
                                        <View style={styles.multiplierBadge}>
                                            <Text style={styles.multiplierText}>{multiplier}x</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.description}>{desc}</Text>
                                </View>
                                {isSelected && (
                                    <Check size={24} color={primaryColor} style={styles.checkIcon} />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {errors.activityLevel && (
                <ThemedText style={[styles.error, { color: errorColor }]}>{errors.activityLevel}</ThemedText>
            )
            }
        </ScrollView >
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
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#4B5563',
        textAlign: 'center',
    },
    options: {
        gap: 12,
        marginBottom: 24,
    },
    option: {
        padding: 24,
        borderRadius: 12,
        borderWidth: 2,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionTextContainer: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontWeight: '600',
        fontSize: 16,
    },
    multiplierBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    multiplierText: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '500',
    },
    description: {
        color: '#4B5563',
        fontSize: 14,
        marginTop: 4,
    },
    checkIcon: {
        marginLeft: 16,
    },
    error: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
});
