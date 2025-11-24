import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hexToRgba } from '@/constants/Colors';

export const PersonalInfoStep = () => {
    const { data, setField, errors } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');
    const errorColor = useThemeColor({}, 'error');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>About You</ThemedText>
                    <ThemedText style={styles.subtitle}>For accurate calculations</ThemedText>
                </View>

                <View style={styles.formContainer}>
                    {/* Age Input */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Age</ThemedText>
                        <TextInput
                            value={data.age}
                            onChangeText={(text) => setField('age', text)}
                            placeholder="25"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            style={[
                                styles.input,
                                {
                                    borderColor: errors.age ? errorColor : borderColor,
                                    color: textColor,
                                    backgroundColor: backgroundColor
                                }
                            ]}
                        />
                        {errors.age && <Text style={[styles.errorText, { color: errorColor }]}>{errors.age}</Text>}
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.fieldContainer}>
                        <ThemedText style={styles.label}>Gender</ThemedText>
                        <View style={styles.genderRow}>
                            {(['male', 'female', 'other'] as const).map((gender) => {
                                const isSelected = data.gender === gender;
                                return (
                                    <TouchableOpacity
                                        // FIX: Include isSelected in key to force component remount on Android
                                        key={`${gender}-${isSelected}`}
                                        onPress={() => setField('gender', gender)}
                                        style={[
                                            styles.genderButton,
                                            {
                                                borderColor: isSelected ? primaryColor : borderColor,
                                                backgroundColor: isSelected ? hexToRgba(primaryColor, 0.2) : 'transparent'
                                            }
                                        ]}
                                    >
                                        <ThemedText style={[
                                            styles.genderText,
                                            { color: isSelected ? primaryColor : textColor }
                                        ]}>
                                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {errors.gender && <Text style={[styles.errorText, { color: errorColor }]}>{errors.gender}</Text>}
                    </View>

                    {/* Weight and Height Row */}
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <ThemedText style={styles.label}>Weight (kg)</ThemedText>
                            <TextInput
                                value={data.weight}
                                onChangeText={(text) => setField('weight', text)}
                                placeholder="70"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                style={[
                                    styles.input,
                                    {
                                        borderColor: errors.weight ? errorColor : borderColor,
                                        color: textColor,
                                        backgroundColor: backgroundColor
                                    }
                                ]}
                            />
                            {errors.weight && <Text style={[styles.errorText, { color: errorColor }]}>{errors.weight}</Text>}
                        </View>

                        <View style={styles.halfField}>
                            <ThemedText style={styles.label}>Height (cm)</ThemedText>
                            <TextInput
                                value={data.height}
                                onChangeText={(text) => setField('height', text)}
                                placeholder="170"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                style={[
                                    styles.input,
                                    {
                                        borderColor: errors.height ? errorColor : borderColor,
                                        color: textColor,
                                        backgroundColor: backgroundColor
                                    }
                                ]}
                            />
                            {errors.height && <Text style={[styles.errorText, { color: errorColor }]}>{errors.height}</Text>}
                        </View>
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
    header: {
        paddingVertical: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        opacity: 0.7,
        textAlign: 'center',
    },
    formContainer: {
        gap: 16,
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
    genderRow: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    genderText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    halfField: {
        flex: 1,
        gap: 8,
    },
});