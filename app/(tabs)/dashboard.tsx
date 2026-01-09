import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/userStore';
import { CalorieCard } from '@/components/dashboard/CalorieCard';
import { MacroCard } from '@/components/dashboard/MacroCard';
import { ActivityGrid } from '@/components/dashboard/ActivityGrid';
import { useFoodLogStore } from '@/stores/foodLogStore';
import { MacroBar } from '@/components/dashboard/MacroBar';
import { WaterTracker } from '@/components/dashboard/WaterTracker';


const Dashboard = () => {

    const backgroundColor = useThemeColor({}, 'background');
    const { profile } = useUserStore();
    const user = useUserStore((state) => state.user);
    
    const today = new Date().toISOString().split('T')[0];

    const { days, fetchSummaryForDate } = useFoodLogStore();

    const day = days[today];

    const summary = day?.summary ?? null;
    const isLoading = day?.isFetchingSummary ?? false;
    const error = day?.error ?? null;

    const [waterGlasses, setWaterGlasses] = useState(3);

    const caloriesGoal = profile?.daily_calorie_goal ?? 0;
    const proteinGoal = profile?.protein_goal_g ?? 0;
    const carbsGoal = profile?.carbs_goal_g ?? 0;
    const fatGoal = profile?.fat_goal_g ?? 0;

    const caloriesConsumed = summary?.total_calories ?? 0;
    const proteinConsumed = summary?.total_protein_g ?? 0;
    const carbsConsumed = summary?.total_carbs_g ?? 0;
    const fatConsumed = summary?.total_fat_g ?? 0;

    useEffect(() => {
        fetchSummaryForDate(today);
    }, [today]);

    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

    const macroColors = {
        carbs: '#fb923c',
        protein: '#60a5fa',
        fat: '#4ade80',
    };



    if (isLoading && !summary) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor }}>
                <ThemedText>Loading…</ThemedText>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor }}>
                <ThemedText>{error}</ThemedText>
            </SafeAreaView>
        );
    }


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
                    <View style={{ flexDirection: 'column' }}>
                        <MacroBar
                            label="Protein"
                            consumed={proteinConsumed}
                            goal={proteinGoal}
                            color="#3B82F6"
                            icon="🥩"
                        />
                        <MacroBar
                            label="Carbs"
                            consumed={carbsConsumed}
                            goal={carbsGoal}
                            color="#F59E0B"
                            icon="🌾"
                        />
                        <MacroBar
                            label="Fat"
                            consumed={fatConsumed}
                            goal={fatGoal}
                            color="#10B981"
                            icon="🥑"
                        />
                    </View>
                </ThemedView>

                {/* Water Tracker */}
                <ThemedView style={{ marginHorizontal: 24, marginBottom: 24 }}>
                    <WaterTracker
                        consumed={waterGlasses}
                        goal={8}
                        onAddGlass={() => setWaterGlasses(prev => Math.min(prev + 1, 8))}
                        onRemoveGlass={() => setWaterGlasses(prev => Math.max(prev - 1, 0))}
                    />
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