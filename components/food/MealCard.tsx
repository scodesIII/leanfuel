import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodLogItem } from '@/components/food/FoodLogItem';
import { MealType } from '@/types/food';


interface FoodLog {
    id: string;
    meal_type: string;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    consumed_at: string;
    food_item?: {
        name: string;
    } | null;
}

interface MealCardProps {
    mealType: MealType;
    foods: FoodLog[];
    onAddPress: () => void;
}

// Meal configuration: icon and background color
const mealConfig: Record<MealType, { icon: string; bg: string }> = {
    breakfast: { icon: '🌅', bg: '#FEF3C7' },
    lunch: { icon: '☀️', bg: '#DBEAFE' },
    dinner: { icon: '🌙', bg: '#FCE7F3' },
    snack: { icon: '🍎', bg: '#D1FAE5' },
};

export function MealCard({ mealType, foods, onAddPress }: MealCardProps) {
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');

    const config = mealConfig[mealType];
    const totalCalories = foods.reduce((sum, log) => sum + log.calories, 0);
    const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return (
        <View style={[styles.card, { backgroundColor: cardColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Meal Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                        <Text style={styles.icon}>{config.icon}</Text>
                    </View>

                    {/* Meal Info */}
                    <View style={styles.mealInfo}>
                        <Text style={[styles.mealTitle, { color: textColor }]}>
                            {mealLabel}
                        </Text>
                        <Text style={[styles.mealCalories, { color: mutedColor }]}>
                            {totalCalories > 0 ? `${totalCalories} kcal` : '0 kcal'}
                        </Text>
                    </View>
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: primaryColor }]}
                    onPress={onAddPress}
                    activeOpacity={0.7}
                >
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Food List or Empty State */}
            {foods.length > 0 ? (
                <View style={styles.foodList}>
                    {foods.map((log) => (
                        <FoodLogItem key={log.id} log={log} />
                    ))}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: mutedColor }]}>
                        No foods logged yet
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: primaryColor + '15' }]}
                        onPress={onAddPress}
                        activeOpacity={0.7}
                    >
                        <Plus size={14} color={primaryColor} />
                        <Text style={[styles.emptyButtonText, { color: primaryColor }]}>
                            Add Food
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 20,
    },
    mealInfo: {
        gap: 2,
    },
    mealTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    mealCalories: {
        fontSize: 13,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    foodList: {
        borderTopWidth: 0,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    emptyText: {
        fontSize: 14,
        marginBottom: 12,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    emptyButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
});