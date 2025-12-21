import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodSearchModal } from '@/components/food/FoodSearchModal';
import { FoodSearchResult, MealType } from '@/types/food';

export default function FoodLoggingScreen() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

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
        
        // Close modal for now
        setSearchModalVisible(false);
        
        // TODO: Open portion selector modal
    };

    const formatMealLabel = (meal: MealType) => {
        return meal.charAt(0).toUpperCase() + meal.slice(1);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>Food Diary</Text>
                    <Text style={[styles.subtitle, { color: mutedColor }]}>
                        Track your meals for today
                    </Text>
                </View>

                {/* Meal Sections */}
                {mealTypes.map((meal) => (
                    <View
                        key={meal}
                        style={[styles.mealCard, { backgroundColor: cardColor, borderColor }]}
                    >
                        <View style={styles.mealHeader}>
                            <Text style={[styles.mealTitle, { color: textColor }]}>
                                {formatMealLabel(meal)}
                            </Text>
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: primaryColor }]}
                                onPress={() => handleOpenSearch(meal)}
                            >
                                <Plus size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Empty state for now */}
                        <View style={styles.emptyMeal}>
                            <Text style={[styles.emptyText, { color: mutedColor }]}>
                                No foods logged
                            </Text>
                        </View>
                    </View>
                ))}
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
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    mealCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    mealTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMeal: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    emptyText: {
        fontSize: 14,
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