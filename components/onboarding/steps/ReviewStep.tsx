import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useUserStore } from '@/stores/userStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { isNetworkError, isAuthError, getErrorMessage, getErrorTitle } from '@/utils/errorHandling';
import { validateOnboardingData } from '@/utils/validation';
import { supabase } from '@/lib/superbase';

export const ReviewStep = () => {
    const { data, complete } = useOnboardingStore();
    const { user, fetchProfile, isLoading } = useUserStore();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const successColor = useThemeColor({}, 'success');

    const handleComplete = async () => {
        // Check if user is authenticated before proceeding
        if (!user) {
            Alert.alert('Error', 'You must be logged in to complete onboarding.');
            return;
        }

        // RE-VALIDATE all onboarding data before saving to database
        // This prevents data manipulation and ensures data integrity
        const validation = validateOnboardingData(data);

        if (!validation.isValid) {
            // Show validation errors to user
            const errorMessages = Object.values(validation.errors).join('\n\n');
            Alert.alert(
                'Invalid Information',
                `Please check your information:\n\n${errorMessages}`,
                [{ text: 'OK' }]
            );

            // Log validation errors for debugging
            console.error('❌ Validation failed:', validation.errors);
            return;
        }

        try {
            // Call database function to atomically save onboarding data and calculate nutrition goals
            const { data: rpcData, error } = await supabase.rpc('complete_onboarding', {
                p_user_id: user.id,
                p_goal: data.goal,
                p_activity_level: data.activityLevel,
                p_dietary_preferences: data.dietaryPreferences,
                p_age: data.age,
                p_gender: data.gender,
                p_current_weight: data.weight,
                p_target_weight: data.targetWeight,
                p_height: data.height,
                p_timeframe: data.timeframe
            })

            if (error) {
                console.error('Error calling complete_onboarding:', error);
                throw error;
            }

            // Log the calculations performed by the database
            console.log('✅ Onboarding completed successfully:', {
                bmr: rpcData.calculations.bmr,
                tdee: rpcData.calculations.tdee,
                dailyCalories: rpcData.calculations.calorie_goal,
                macros: {
                    protein: rpcData.calculations.protein_goal_g,
                    carbs: rpcData.calculations.carbs_goal_g,
                    fat: rpcData.calculations.fat_goal_g
                },
                percentages: {
                    protein: rpcData.calculations.protein_percentage,
                    carbs: rpcData.calculations.carbs_percentage,
                    fat: rpcData.calculations.fat_percentage
                }
            });

            // Refresh profile from database to get the updated data
            // The RPC function already saved everything, we just need to sync local state
            await fetchProfile();

            // Mark onboarding as complete in the store
            complete();

            // Navigate to dashboard
            router.replace('/(tabs)/dashboard');
        } catch (error) {
            // Log technical error for debugging
            console.error('Failed to save profile:', error);

            // Determine error type and show appropriate user-friendly message
            if (isNetworkError(error)) {
                // Network error - offer retry
                Alert.alert(
                    'No Internet Connection',
                    'Please check your connection and try again.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Retry', onPress: () => handleComplete() }
                    ]
                );
            } else if (isAuthError(error)) {
                // Auth error - redirect to signin
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please sign in again to continue.',
                    [
                        {
                            text: 'Sign In',
                            onPress: () => router.replace('/(auth)/signin')
                        }
                    ]
                );
            } else {
                // Other errors - show user-friendly message
                const errorMessage = getErrorMessage(error);
                const errorTitle = getErrorTitle(error);

                Alert.alert(
                    errorTitle,
                    errorMessage,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Try Again', onPress: () => handleComplete() }
                    ]
                );
            }
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

            {/* Create My Plan Button with Loading State */}
            <TouchableOpacity
                onPress={handleComplete}
                disabled={isLoading} // Disable button during loading to prevent double-clicks
                activeOpacity={0.7}
                style={[
                    styles.completeButton,
                    {
                        backgroundColor: isLoading ? `${primaryColor}80` : primaryColor, // 50% opacity when loading
                        opacity: isLoading ? 0.7 : 1 // Additional visual feedback
                    }
                ]}
            >
                {isLoading ? (
                    // Show spinner while saving profile
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    // Show button text when not loading
                    <Text style={styles.completeButtonText}>Create My Plan</Text>
                )}
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
