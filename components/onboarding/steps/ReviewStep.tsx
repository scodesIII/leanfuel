import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useUserStore } from '@/stores/userStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { isNetworkError, isAuthError, getErrorMessage, getErrorTitle } from '@/utils/errorHandling';

export const ReviewStep = () => {
    const { data, complete } = useOnboardingStore();
    const { user, updateProfile } = useUserStore();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const successColor = useThemeColor({}, 'success');

    // Calculate BMR using Mifflin-St Jeor Equation
    const calculateBMR = () => {
        const weight = parseFloat(data.weight);
        const height = parseFloat(data.height);
        const age = parseInt(data.age);
        const isMale = data.gender === 'male';

        // BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + s
        // s = +5 for males, -161 for females
        const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
        return Math.round(bmr);
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    const calculateTDEE = (bmr: number) => {
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            very: 1.725,
            extra: 1.9,
        };
        const multiplier = activityMultipliers[data.activityLevel as keyof typeof activityMultipliers] || 1.2;
        return Math.round(bmr * multiplier);
    };

    // Calculate daily calorie goal based on goal
    const calculateCalorieGoal = (tdee: number) => {
        const currentWeight = parseFloat(data.weight);
        const targetWeight = parseFloat(data.targetWeight);
        const weightDiff = currentWeight - targetWeight;

        if (data.goal === 'lose') {
            // Deficit of 500 calories per day (lose ~0.5kg per week)
            return Math.round(tdee - 500);
        } else if (data.goal === 'gain') {
            // Surplus of 300-500 calories per day
            return Math.round(tdee + 400);
        } else {
            // Maintain weight
            return tdee;
        }
    };

    const handleComplete = async () => {
        // Check if user is authenticated before proceeding
        if (!user) {
            Alert.alert('Error', 'You must be logged in to complete onboarding.');
            return;
        }

        try {
            // Calculate nutritional goals
            const bmr = calculateBMR();
            const tdee = calculateTDEE(bmr);
            const dailyCalories = calculateCalorieGoal(tdee);

            // Calculate macros (40% protein, 30% carbs, 30% fat for balanced approach)
            const proteinCalories = dailyCalories * 0.4;
            const carbsCalories = dailyCalories * 0.3;
            const fatCalories = dailyCalories * 0.3;

            const proteinGrams = Math.round(proteinCalories / 4); // 4 cal per gram
            const carbsGrams = Math.round(carbsCalories / 4); // 4 cal per gram
            const fatGrams = Math.round(fatCalories / 9); // 9 cal per gram

            // Update profile with onboarding data
            await updateProfile({
                onboarding_completed: true,
                profile_completed: true,
                daily_calorie_goal: dailyCalories,
                protein_goal_g: proteinGrams,
                carbs_goal_g: carbsGrams,
                fat_goal_g: fatGrams,
            });

            // Mark onboarding as complete in the store
            complete();

            console.log('✅ Profile updated successfully:', {
                bmr,
                tdee,
                dailyCalories,
                macros: { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams }
            });

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
