import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodSearchModal } from '@/components/food/FoodSearchModal';
import { FoodSearchResult, MealType } from '@/types/food';
import { PortionSelector } from '@/components/food/PortionSelector';
import { FoodLog, useFoodLogStore } from '@/stores/foodLogStore';
import { DailySummaryMini } from '@/components/food/DailySummaryMini';
import { useUserStore } from '@/stores/userStore';
import { MealCard } from '@/components/food/MealCard';
import { DateNavigator } from '@/components/food/DateNavigator';
import { EditFoodLogModal } from '@/components/food/EditFoodLogModal';
import { normalizeDate, addDays, isSameDay, parseLocalDate, dateToLocalString } from '@/lib/date';





export default function FoodLoggingScreen() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
    const [portionSelectorVisible, setPortionSelectorVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
    const addLog = useFoodLogStore((state) => state.addLog);
    const [isSaving, setIsSaving] = useState(false);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState<FoodLog | null>(null);

    const { profile } = useUserStore();
    const { fetchLogsForDate, fetchSummaryForDate, setSelectedDate, deleteLog, updateLog } = useFoodLogStore();

    const { selectedDate, days } = useFoodLogStore();

    const day = days[selectedDate];

    const logs = day?.logs ?? [];
    const summary = day?.summary ?? null;
    const isLoadingLogs = day?.isFetchingLogs ?? false;
    const isLoadingSummary = day?.isFetchingSummary ?? false;
    const error = day?.error ?? null;

    const consumed = summary?.total_calories ?? 0;
    const goal = profile?.daily_calorie_goal ?? 2000;
    const remaining = Math.max(goal - consumed, 0);


    const backgroundColor = useThemeColor({}, 'background');
    const primaryColor = useThemeColor({}, 'primary');

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
            
        } else {
            // TODO: Show error toast
            console.error('❌ Failed to log food');
        }
    };

    const formatMealLabel = (meal: MealType) => {
        return meal.charAt(0).toUpperCase() + meal.slice(1);
    };

    const groupLogsByMeal = () => {
        const grouped: Record<string, typeof logs> = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
        };

        logs.forEach((log) => {
            if (grouped[log.meal_type]) {
                grouped[log.meal_type].push(log);
            }
        });

        return grouped;
    };

    const groupedLogs = groupLogsByMeal();


    const selectedDateObj = parseLocalDate(selectedDate);
    const today = normalizeDate(new Date());
    const yesterday = addDays(today, -1);

    const isToday = isSameDay(selectedDateObj, today);
    const isYesterday = isSameDay(selectedDateObj, yesterday);

    const label = isToday
        ? 'Today'
        : isYesterday
        ? 'Yesterday'
        : selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const subLabel = selectedDateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });


    const handlePreviousDay = () => {
        console.log('🔴 handlePreviousDay called');
        console.log('selectedDate (from store):', selectedDate);
        console.log('selectedDateObj (parsed):', selectedDateObj);

        const prev = addDays(selectedDateObj, -1);
        console.log('prev (after addDays):', prev);

        const prevDateString = dateToLocalString(prev);
        console.log('prevDateString (converted to string):', prevDateString);

        setSelectedDate(prevDateString);
    };

    const handleNextDay = () => {
        console.log('🟢 handleNextDay called');
        console.log('selectedDate (from store):', selectedDate);
        console.log('selectedDateObj (parsed):', selectedDateObj);
        console.log('today:', today);

        const next = addDays(selectedDateObj, 1);
        console.log('next (after addDays):', next);

        const nextDateString = dateToLocalString(next);
        const todaysDateString = dateToLocalString(today);

        console.log('nextDateString:', nextDateString);
        console.log('todaysDateString:', todaysDateString);
        console.log('comparison (nextDateString <= todaysDateString):', nextDateString <= todaysDateString);

        // prevent going into the future
        if (nextDateString <= todaysDateString) {
            console.log('✅ Condition TRUE, calling setSelectedDate');
            setSelectedDate(nextDateString);
        } else {
            console.log('❌ Condition FALSE, NOT calling setSelectedDate');
        }
    };


    const handleDeleteLog = async (id: string) => {
        await deleteLog(id);
    };

    const handlePressLog = (log: FoodLog) => {
        setSelectedLog(log);
        setEditModalVisible(true);
    };

    const handleSaveLog = async (id: string, updates: { servings: number; meal_type: MealType }) => {
        if (isSaving) return;

        const originalLog = logs.find(log => log.id === id);
        if (!originalLog) return;

        setIsSaving(true);

        //
       try {
            const baseCalories = originalLog.calories / originalLog.servings;
            const baseProtein = originalLog.protein_g / originalLog.servings;
            const baseCarbs = originalLog.carbs_g / originalLog.servings;
            const baseFat = originalLog.fat_g / originalLog.servings;
            const baseFiber = originalLog.fiber_g / originalLog.servings;
            const baseSugar = originalLog.sugar_g / originalLog.servings;
            const baseSodium = originalLog.sodium_mg / originalLog.servings;

            await updateLog(id, {
                servings: updates.servings,
                meal_type: updates.meal_type,
                calories: Math.round(baseCalories * updates.servings),
                protein_g: Math.round(baseProtein * updates.servings),
                carbs_g: Math.round(baseCarbs * updates.servings),
                fat_g: Math.round(baseFat * updates.servings),
                fiber_g: Math.round(baseFiber * updates.servings),
                sugar_g: Math.round(baseSugar * updates.servings),
                sodium_mg: Math.round(baseSodium * updates.servings),
            });
       } catch (error) {
            console.error('Failed to update log:', error);
       } finally {
            setIsSaving(false);
       }

        setEditModalVisible(false);
        setSelectedLog(null);
    };


    // Add useEffect to fetch when date changes
    useEffect(() => {
        fetchLogsForDate(selectedDate);
        fetchSummaryForDate(selectedDate);
    }, [selectedDate]);

    // Remove the old useEffect that fetches on mount - the above handles it

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <DateNavigator
                        label={label}
                        subLabel={subLabel}
                        isToday={isToday}
                        onPrevious={handlePreviousDay}
                        onNext={handleNextDay}
                    />

                    <DailySummaryMini consumed={consumed} goal={goal} remaining={remaining} />
                </View>


                <View style={styles.mealsContainer}>
                    {mealTypes.map((meal) => (
                        <MealCard
                            key={meal}
                            mealType={meal}
                            foods={groupedLogs[meal] || []}
                            onAddPress={() => handleOpenSearch(meal)}
                            onDeleteLog={handleDeleteLog}
                            onPressLog={handlePressLog}  
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
            <EditFoodLogModal
                visible={editModalVisible}
                log={selectedLog}
                isSaving={isSaving}
                onClose={() => {
                    setEditModalVisible(false);
                    setSelectedLog(null);
                }}
                onSave={handleSaveLog}
                onDelete={handleDeleteLog}
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