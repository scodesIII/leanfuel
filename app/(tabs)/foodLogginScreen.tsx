import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodSearchModal } from '@/components/food/FoodSearchModal';
import { FoodSearchResult, MealType } from '@/types/food';
import { PortionSelector } from '@/components/food/PortionSelector';
import { useFoodLogStore } from '@/stores/foodLogStore';
import { DailySummaryMini } from '@/components/food/DailySummaryMini';
import { useUserStore } from '@/stores/userStore';
import { MealCard } from '@/components/food/MealCard';
import { DateNavigator } from '@/components/food/DateNavigator';




export default function FoodLoggingScreen() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
    const [portionSelectorVisible, setPortionSelectorVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
    const addLog = useFoodLogStore((state) => state.addLog);
    const { todaysLogs, isLoading, fetchTodaysLogs } = useFoodLogStore();

    const { profile } = useUserStore();
    const { todaysSummary, fetchTodaysSummary } = useFoodLogStore();

    const consumed = todaysSummary?.total_calories ?? 0;
    const goal = profile?.daily_calorie_goal ?? 2000;
    const remaining = Math.max(goal - consumed, 0);





    // Fetch logs on mount
    useEffect(() => {
        fetchTodaysLogs();

    }, []);

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

    const handleOpenSearch = (mealType: MealType) => {
        setSelectedMealType(mealType);
        setSearchModalVisible(true);
    };

    const handleSelectFood = (item: FoodSearchResult, mealType: MealType) => {
        // For now, just log to console
        // Later: navigate to portion selector or add directly
        console.log('Selected food:', item.name);
        console.log('Meal type:', mealType);
        console.log('Calories:', item.calories);

        setSelectedFood(item);
        setSearchModalVisible(false);

        // Small delay to let search modal close before opening portion selector
        setTimeout(() => {
            setPortionSelectorVisible(true);
        }, 300);
    };

    const handleConfirmPortion = async (food: FoodSearchResult, servings: number, mealType: MealType) => {
        // Close modal immediately for snappy UX
        setPortionSelectorVisible(false);
        setSelectedFood(null);

        // Save to database
        const result = await addLog({
            food_item_id: food.id,
            meal_type: mealType,
            servings,
            calories: Math.round(food.calories * servings),
            protein_g: Math.round(food.protein_g * servings),
            carbs_g: Math.round(food.carbs_g * servings),
            fat_g: Math.round(food.fat_g * servings),
            fiber_g: Math.round((food.fiber_g ?? 0) * servings),
            sugar_g: Math.round((food.sugar_g ?? 0) * servings),
            sodium_mg: Math.round((food.sodium_mg ?? 0) * servings),
        });

        if (result) {
            console.log('✅ Food logged:', result.id);
            fetchTodaysLogs();
        } else {
            // TODO: Show error toast
            console.error('❌ Failed to log food');
        }
    };

    const formatMealLabel = (meal: MealType) => {
        return meal.charAt(0).toUpperCase() + meal.slice(1);
    };

    const groupLogsByMeal = () => {
        const grouped: Record<string, typeof todaysLogs> = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
        };

        todaysLogs.forEach((log) => {
            if (grouped[log.meal_type]) {
                grouped[log.meal_type].push(log);
            }
        });

        return grouped;
    };

    const groupedLogs = groupLogsByMeal();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <DateNavigator
                        selectedDate={new Date()}
                        onPrevious={() => console.log('prev')}
                        onNext={() => console.log('next')}
                    />

                    <DailySummaryMini consumed={consumed} goal={goal} remaining={remaining}/>
                </View>


                <View style={styles.mealsContainer}>
                    {mealTypes.map((meal) => (
                        <MealCard
                            key={meal}
                            mealType={meal}
                            foods={groupedLogs[meal] || []}
                            onAddPress={() => handleOpenSearch(meal)}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: primaryColor }]}
                onPress={() => handleOpenSearch('snack')}
            >
                <Plus size={24} color="white" />
            </TouchableOpacity>

            {/* Search Modal */}
            <FoodSearchModal
                visible={searchModalVisible}
                onClose={() => setSearchModalVisible(false)}
                onSelectFood={handleSelectFood}
                mealType={selectedMealType}
            />

            <PortionSelector
                visible={portionSelectorVisible}
                food={selectedFood}
                mealType={selectedMealType}
                onClose={() => {
                    setPortionSelectorVisible(false);
                    setSelectedFood(null);
                }}
                onConfirm={handleConfirmPortion}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#ffffff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingBottom: 16,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    mealsContainer: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});