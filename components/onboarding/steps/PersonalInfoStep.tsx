import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useThemeColor } from '@/hooks/useThemeColor';

export const PersonalInfoStep = () => {
    const { data, setField, errors } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>About You</Text>
                    <Text style={styles.subtitle}>For accurate calculations</Text>
                </View>

                <View style={styles.formContainer}>
                    {/* Age Input */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: textColor }]}>Age</Text>
                        <TextInput
                            value={data.age}
                            onChangeText={(text) => setField('age', text)}
                            placeholder="25"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            style={[
                                styles.input,
                                {
                                    borderColor: errors.age ? '#EF4444' : '#E5E7EB',
                                    color: textColor,
                                    backgroundColor: backgroundColor
                                }
                            ]}
                        />
                        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
                    </View>

                    {/* Gender Selection */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: textColor }]}>Gender</Text>
                        <View style={styles.genderRow}>
                            {(['male', 'female', 'other'] as const).map((gender) => (
                                <TouchableOpacity
                                    key={gender}
                                    onPress={() => setField('gender', gender)}
                                    style={[
                                        styles.genderButton,
                                        {
                                            borderColor: data.gender === gender ? primaryColor : '#E5E7EB',
                                            backgroundColor: data.gender === gender ? `${primaryColor}15` : backgroundColor
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.genderText,
                                        { color: data.gender === gender ? primaryColor : textColor }
                                    ]}>
                                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                    </View>

                    {/* Weight and Height Row */}
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={[styles.label, { color: textColor }]}>Weight (kg)</Text>
                            <TextInput
                                value={data.weight}
                                onChangeText={(text) => setField('weight', text)}
                                placeholder="70"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                style={[
                                    styles.input,
                                    {
                                        borderColor: errors.weight ? '#EF4444' : '#E5E7EB',
                                        color: textColor,
                                        backgroundColor: backgroundColor
                                    }
                                ]}
                            />
                            {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
                        </View>

                        <View style={styles.halfField}>
                            <Text style={[styles.label, { color: textColor }]}>Height (cm)</Text>
                            <TextInput
                                value={data.height}
                                onChangeText={(text) => setField('height', text)}
                                placeholder="170"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                style={[
                                    styles.input,
                                    {
                                        borderColor: errors.height ? '#EF4444' : '#E5E7EB',
                                        color: textColor,
                                        backgroundColor: backgroundColor
                                    }
                                ]}
                            />
                            {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
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
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
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
        color: '#EF4444',
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