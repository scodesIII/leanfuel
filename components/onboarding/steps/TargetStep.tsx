import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hexToRgba } from '@/constants/Colors';

export const TargetStep = () => {
    const { data, setField, errors } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');
    const errorColor = useThemeColor({}, 'error');

    const timeframes = [
        { id: '3months' as const, label: '3 Months', desc: 'Aggressive' },
        { id: '6months' as const, label: '6 Months', desc: 'Balanced' },
        { id: '12months' as const, label: '12 Months', desc: 'Sustainable' },
        { id: 'flexible' as const, label: 'Flexible', desc: 'No rush' },
    ];

    const weightDiff =
        data.weight && data.targetWeight
            ? Math.abs(parseFloat(data.weight) - parseFloat(data.targetWeight))
            : 0;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Your Target</ThemedText>
                    <ThemedText style={styles.subtitle}>Goal & timeline</ThemedText>
                </View>

                <View style={styles.formContainer}>
                    {/* Target Weight Input */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Target Weight (kg)</ThemedText>
                        <TextInput
                            value={data.targetWeight}
                            onChangeText={(text) => setField('targetWeight', text)}
                            placeholder="65"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            style={[
                                styles.input,
                                {
                                    borderColor: errors.targetWeight ? errorColor : borderColor,
                                    color: textColor,
                                    backgroundColor: backgroundColor
                                }
                            ]}
                        />
                        {errors.targetWeight && (
                            <Text style={[styles.errorText, { color: errorColor }]}>{errors.targetWeight}</Text>
                        )}
                        {weightDiff > 0 && (
                            <Text style={styles.infoText}>
                                {weightDiff.toFixed(1)} kg{' '}
                                {parseFloat(data.weight) > parseFloat(data.targetWeight) ? 'loss' : 'gain'}
                            </Text>
                        )}
                    </View>

                    {/* Timeframe Selection */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Timeframe</ThemedText>
                        <View style={styles.options}>
                            {timeframes.map(({ id, label, desc }) => {
                                const isSelected = data.timeframe === id;

                                // Pre-compute colors for better Android performance
                                const optionBorderColor = isSelected ? primaryColor : borderColor;
                                const optionBackgroundColor = isSelected ? hexToRgba(primaryColor, 0.2) : backgroundColor;

                                return (
                                    <TouchableOpacity
                                        key={id}
                                        activeOpacity={0.7}
                                        onPress={() => setField('timeframe', id)}
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
                                                <ThemedText style={styles.optionLabel}>{label}</ThemedText>
                                                <Text style={styles.optionDesc}>{desc}</Text>
                                            </View>
                                            {isSelected && <Check size={24} color={primaryColor} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {errors.timeframe && (
                            <Text style={[styles.errorText, { color: errorColor }]}>{errors.timeframe}</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
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
        opacity: 0.7,
        textAlign: 'center',
    },
    formContainer: {
        gap: 24,
        marginBottom: 24,
    },
    fieldContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    infoText: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 8,
    },
    options: {
        gap: 12,
    },
    option: {
        padding: 16,
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
    optionLabel: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
    },
    optionDesc: {
        color: '#6B7280',
        fontSize: 14,
    },
});