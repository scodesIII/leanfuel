import React from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/userStore';
import { CalorieCard } from '@/components/dashboard/CalorieCard';
import { MacroCard } from '@/components/dashboard/MacroCard';
import { ActivityGrid } from '@/components/dashboard/ActivityGrid';

const Dashboard = () => {
    const backgroundColor = useThemeColor({}, 'background');
    const { profile } = useUserStore();
    const user = useUserStore((state) => state.user);

    // Real data from profile (calculated during onboarding)
    const caloriesGoal = profile?.daily_calorie_goal ?? 0;
    const proteinGoal = profile?.protein_goal_g ?? 0;
    const carbsGoal = profile?.carbs_goal_g ?? 0;
    const fatGoal = profile?.fat_goal_g ?? 0;

    // Consumed values - will come from food logs later
    // For now, show 0 (empty state)
    const caloriesConsumed = 0;
    const proteinConsumed = 0;
    const carbsConsumed = 0;
    const fatConsumed = 0;

    // Display name
    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

    // Macro colors
    const macroColors = {
        carbs: '#fb923c',
        protein: '#60a5fa',
        fat: '#4ade80',
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <ThemedView style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                    <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
                        Hi, {displayName}! 👋
                    </ThemedText>
                    <ThemedText style={{ opacity: 0.7, marginTop: 4 }}>
                        Let's crush your goals today
                    </ThemedText>
                </ThemedView>

                {/* Main Calorie Card */}
                <ThemedView style={{ marginHorizontal: 24, marginBottom: 24 }}>
                    <CalorieCard
                        consumed={caloriesConsumed}
                        goal={caloriesGoal}
                    />
                </ThemedView>

                {/* Macros Section */}
                <ThemedView style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                    <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
                        Macronutrients
                    </ThemedText>
                    <View style={{ flexDirection: 'row' }}>
                        <MacroCard
                            label="CARBS"
                            consumed={carbsConsumed}
                            goal={carbsGoal}
                            color={macroColors.carbs}
                        />
                        <MacroCard
                            label="PROTEIN"
                            consumed={proteinConsumed}
                            goal={proteinGoal}
                            color={macroColors.protein}
                        />
                        <MacroCard
                            label="FAT"
                            consumed={fatConsumed}
                            goal={fatGoal}
                            color={macroColors.fat}
                        />
                    </View>
                </ThemedView>

                {/* Activity Grid */}
                <ThemedView style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                    <ActivityGrid />
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Dashboard;