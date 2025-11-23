import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { hexToRgba } from '@/constants/Colors';

const preferences = ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo'];

export const DietaryStep = () => {
    const { data, setField } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const togglePreference = (pref: string) => {
        const current = data.dietaryPreferences;

        if (pref === 'None') {
            setField('dietaryPreferences', ['None']);
        } else {
            const filtered = current.filter((p) => p !== 'None');
            const updated = filtered.includes(pref)
                ? filtered.filter((p) => p !== pref)
                : [...filtered, pref];
            setField('dietaryPreferences', updated);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Dietary Preferences
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Optional
                </ThemedText>
            </View>

            {/* Preference Options */}
            <View style={styles.options}>
                {preferences.map((pref) => {
                    const isSelected = data.dietaryPreferences.includes(pref);

                    // Pre-compute colors for Android compatibility
                    const optionBorderColor = isSelected ? primaryColor : borderColor;
                    const optionBackgroundColor = isSelected ? hexToRgba(primaryColor, 0.2) : 'transparent';

                    return (
                        <TouchableOpacity
                            // Include isSelected in key to force re-render (Android fix)
                            key={`${pref}-${isSelected}`}
                            onPress={() => togglePreference(pref)}
                            style={[
                                styles.option,
                                {
                                    borderColor: optionBorderColor,
                                    backgroundColor: optionBackgroundColor,
                                }
                            ]}
                        >
                            <View style={styles.optionContent}>
                                <ThemedText style={styles.optionLabel}>{pref}</ThemedText>
                                {isSelected && (
                                    <Check size={20} color={primaryColor} />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
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
        color: '#4B5563',
        textAlign: 'center',
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    option: {
        flexBasis: '48%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
});
