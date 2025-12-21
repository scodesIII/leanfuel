import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Minus, Plus } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodSearchResult, MealType } from '@/types/food';

interface PortionSelectorProps {
    visible: boolean;
    food: FoodSearchResult | null;
    mealType: MealType;
    onClose: () => void;
    onConfirm: (food: FoodSearchResult, servings: number, mealType: MealType) => void;
}

// Serving increment options
const SERVING_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

export function PortionSelector({
    visible,
    food,
    mealType,
    onClose,
    onConfirm,
}: PortionSelectorProps) {
    const [servings, setServings] = useState(1);

    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    // Reset servings when modal opens with new food
    const handleOpen = () => {
        setServings(1);
    };

    // Calculate nutrition based on servings
    const calculateNutrition = (base: number) => {
        return Math.round(base * servings);
    };

    // Increment/decrement servings
    const adjustServings = (delta: number) => {
        const currentIndex = SERVING_STEPS.indexOf(servings);
        
        if (currentIndex === -1) {
            // Current value not in steps, find nearest
            setServings(1);
            return;
        }

        const newIndex = currentIndex + delta;
        if (newIndex >= 0 && newIndex < SERVING_STEPS.length) {
            setServings(SERVING_STEPS[newIndex]);
        }
    };

    // Handle confirm
    const handleConfirm = () => {
        if (food) {
            onConfirm(food, servings, mealType);
        }
    };

    // Format meal type for display
    const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    if (!food) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
            onShow={handleOpen}
        >
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
                        <X size={24} color={textColor} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: textColor }]}>
                        Add Food
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Food Info */}
                <View style={[styles.foodInfo, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.foodName, { color: textColor }]}>
                        {food.name}
                    </Text>
                    <Text style={[styles.foodMeta, { color: mutedColor }]}>
                        {food.brand && `${food.brand} • `}
                        {food.serving_size}{food.serving_unit} per serving
                    </Text>
                </View>

                {/* Serving Selector */}
                <View style={[styles.servingSection, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.sectionLabel, { color: mutedColor }]}>
                        SERVINGS
                    </Text>
                    <View style={styles.servingControl}>
                        <TouchableOpacity
                            onPress={() => adjustServings(-1)}
                            style={[styles.servingButton, { backgroundColor: borderColor }]}
                            disabled={servings <= SERVING_STEPS[0]}
                        >
                            <Minus size={20} color={servings <= SERVING_STEPS[0] ? mutedColor : textColor} />
                        </TouchableOpacity>

                        <View style={styles.servingValue}>
                            <Text style={[styles.servingNumber, { color: textColor }]}>
                                {servings}
                            </Text>
                            <Text style={[styles.servingUnit, { color: mutedColor }]}>
                                = {Math.round(food.serving_size * servings)}{food.serving_unit}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => adjustServings(1)}
                            style={[styles.servingButton, { backgroundColor: borderColor }]}
                            disabled={servings >= SERVING_STEPS[SERVING_STEPS.length - 1]}
                        >
                            <Plus size={20} color={servings >= SERVING_STEPS[SERVING_STEPS.length - 1] ? mutedColor : textColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Nutrition Summary */}
                <View style={styles.nutritionSection}>
                    <Text style={[styles.sectionLabel, { color: mutedColor }]}>
                        NUTRITION
                    </Text>
                    <View style={styles.nutritionGrid}>
                        <View style={[styles.nutritionItem, { backgroundColor: cardColor }]}>
                            <Text style={[styles.nutritionValue, { color: textColor }]}>
                                {calculateNutrition(food.calories)}
                            </Text>
                            <Text style={[styles.nutritionLabel, { color: mutedColor }]}>
                                Calories
                            </Text>
                        </View>
                        <View style={[styles.nutritionItem, { backgroundColor: cardColor }]}>
                            <Text style={[styles.nutritionValue, { color: textColor }]}>
                                {calculateNutrition(food.protein_g)}g
                            </Text>
                            <Text style={[styles.nutritionLabel, { color: mutedColor }]}>
                                Protein
                            </Text>
                        </View>
                        <View style={[styles.nutritionItem, { backgroundColor: cardColor }]}>
                            <Text style={[styles.nutritionValue, { color: textColor }]}>
                                {calculateNutrition(food.carbs_g)}g
                            </Text>
                            <Text style={[styles.nutritionLabel, { color: mutedColor }]}>
                                Carbs
                            </Text>
                        </View>
                        <View style={[styles.nutritionItem, { backgroundColor: cardColor }]}>
                            <Text style={[styles.nutritionValue, { color: textColor }]}>
                                {calculateNutrition(food.fat_g)}g
                            </Text>
                            <Text style={[styles.nutritionLabel, { color: mutedColor }]}>
                                Fat
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Confirm Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: primaryColor }]}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmButtonText}>
                            Add to {mealLabel}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 32,
    },
    foodInfo: {
        padding: 20,
        borderBottomWidth: 1,
    },
    foodName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    foodMeta: {
        fontSize: 14,
    },
    servingSection: {
        padding: 20,
        borderBottomWidth: 1,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 16,
    },
    servingControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    servingButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    servingValue: {
        alignItems: 'center',
        minWidth: 100,
    },
    servingNumber: {
        fontSize: 32,
        fontWeight: '700',
    },
    servingUnit: {
        fontSize: 14,
        marginTop: 4,
    },
    nutritionSection: {
        padding: 20,
        flex: 1,
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    nutritionItem: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    nutritionValue: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 4,
    },
    nutritionLabel: {
        fontSize: 12,
    },
    footer: {
        padding: 16,
        paddingBottom: 24,
    },
    confirmButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});