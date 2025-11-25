import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';

export const ReviewStep = () => {
    const { data, complete } = useOnboardingStore();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const successColor = useThemeColor({}, 'success');

    const handleComplete = async () => {
        try {
            // TODO: Replace with your Supabase call
            console.log('💾 Saving to database:', data);

            complete();

            // Navigate to main app
            router.replace('/(tabs)/dashboard');
        } catch (error) {
            console.error('Failed to save:', error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${successColor}20` }]}>
                    <Check size={32} color={successColor} />
                </View>
                <ThemedText type="title" style={styles.title}>All Set!</ThemedText>
                <ThemedText style={styles.subtitle}>Review before creating your plan</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: cardColor }]}>
                <View style={styles.cardContent}>
                    <View style={styles.row}>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Goal</Text>
                            <ThemedText style={styles.fieldValue}>{data.goal}</ThemedText>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Activity</Text>
                            <ThemedText style={styles.fieldValue}>{data.activityLevel}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Age</Text>
                            <ThemedText style={styles.fieldValue}>{data.age}</ThemedText>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Gender</Text>
                            <ThemedText style={styles.fieldValue}>{data.gender}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Weight</Text>
                            <ThemedText style={styles.fieldValue}>{data.weight} kg</ThemedText>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Target</Text>
                            <ThemedText style={styles.fieldValue}>{data.targetWeight} kg</ThemedText>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Height</Text>
                            <ThemedText style={styles.fieldValue}>{data.height} cm</ThemedText>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Timeline</Text>
                            <ThemedText style={styles.fieldValue}>{data.timeframe}</ThemedText>
                        </View>
                    </View>

                    {data.dietaryPreferences.length > 0 && (
                        <View style={styles.dietaryContainer}>
                            <Text style={styles.fieldLabel}>Dietary</Text>
                            <View style={styles.tagContainer}>
                                {data.dietaryPreferences.map((pref) => (
                                    <View key={pref} style={[styles.tag, { backgroundColor: `${primaryColor}20` }]}>
                                        <Text style={[styles.tagText, { color: primaryColor }]}>{pref}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity
                onPress={handleComplete}
                activeOpacity={0.7}
                style={[styles.completeButton, { backgroundColor: primaryColor }]}
            >
                <Text style={styles.completeButtonText}>Create My Plan</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
        paddingVertical: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
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
    card: {
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
    },
    cardContent: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    field: {
        flex: 1,
    },
    fieldLabel: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 4,
    },
    fieldValue: {
        fontWeight: '600',
        fontSize: 16,
        textTransform: 'capitalize',
    },
    dietaryContainer: {
        marginTop: 8,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    completeButton: {
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    completeButtonText: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 18,
    },
});
