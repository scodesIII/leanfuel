import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useUserStore } from '@/stores/userStore';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { isNetworkError, isAuthError, getErrorMessage, getErrorTitle } from '@/utils/errorHandling';
// import { validateOnboardingData } from '@/utils/validation';
import { supabase } from '@/lib/superbase';

type PlanPreview = {
  calorie_goal: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fat_goal_g: number;
  // + bmr/tdee/*_percentage if you use them
};

export const ReviewStep = () => {
    const { data, complete } = useOnboardingStore();
    const { user, fetchProfile, isLoading } = useUserStore();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const successColor = useThemeColor({}, 'success');

    // fetch the preview on mount
    const [plan, setPlan] = useState<PlanPreview | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [previewError, setPreviewError] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                // Fetch, preview goals from the database
                const { data: planData, error } = await supabase.rpc('preview_goals', {
                    p_age: parseInt(data.age, 10),    // string->number (PostgREST coercion caveat)
                    p_gender: data.gender,
                    p_current_weight: parseFloat(data.weight),
                    p_target_weight: parseFloat(data.targetWeight),
                    p_height: parseFloat(data.height),
                    p_activity_level: data.activityLevel,
                    p_goal: data.goal,
                    // p_dietary_preferences: data.dietaryPreferences,
                    // p_timeframe: data.timeframe
                });

                if (error) {
                    setPreviewError(true);
                    setLoadingPlan(false);
                } else {
                    setPlan(planData);
                }
            } catch (error) {
                setPreviewError(true);
                setLoadingPlan(false);
            } finally {
                setLoadingPlan(false);
            }
        })();
    }, []);
`s32`

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Your Plan Preview */}
            <View style={[styles.card, { backgroundColor: cardColor }]}>
                <ThemedText style={styles.planTitle}>Your Plan</ThemedText>

                {loadingPlan ? (
                    <View style={styles.planLoadingContainer}>
                    <ActivityIndicator color={primaryColor} size="small" />
                    </View>
                ) : previewError ? (
                    <ThemedText style={styles.planErrorText}>
                    Couldn't calculate your plan — go back and check your details
                    </ThemedText>
                ) : plan ? (
                    <>
                    <View style={styles.planCalorieRow}>
                        <ThemedText style={[styles.planCalorieValue, { color: primaryColor }]}>
                        {plan.calorie_goal}
                        </ThemedText>
                        <ThemedText style={styles.planCalorieUnit}>kcal / day</ThemedText>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Protein</Text>
                        <ThemedText style={styles.fieldValue}>{plan.protein_goal_g}g</ThemedText>
                        </View>
                        <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Carbs</Text>
                        <ThemedText style={styles.fieldValue}>{plan.carbs_goal_g}g</ThemedText>
                        </View>
                        <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Fat</Text>
                        <ThemedText style={styles.fieldValue}>{plan.fat_goal_g}g</ThemedText>
                        </View>
                    </View>
                    </>
                ) : null}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    planTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    planLoadingContainer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    planErrorText: {
        color: '#B45309', // soft warning tone, not error-red — matches "don't hard-block"
        fontSize: 14,
        lineHeight: 20,
    },
    planCalorieRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    planCalorieValue: {
        paddingTop: 4,
        fontSize: 36,
        fontWeight: '700',
        marginRight: 6,
    },
    planCalorieUnit: {
        fontSize: 14,
        opacity: 0.7,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
        paddingVertical: 32,
    },
    card: {
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
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
});
