import { FoodLog } from '@/stores/foodLogStore';
import { MealType } from '@/types/food';
import { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Minus, Plus } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';


interface EditFoodLogModalProps {
    visible: boolean;
    log: FoodLog | null;
    onClose: () => void;
    onSave: (id: string, updates: { servings: number; meal_type: MealType }) => void;
    onDelete: (id: string) => void;
}


export function EditFoodLogModal({ visible, log, onClose, onSave, onDelete }: EditFoodLogModalProps) {
    const [servings, setServings] = useState(1);
    const [mealType, setMealType] = useState<MealType>('breakfast');

    useEffect(() => {
        if (visible && log) {
            setServings(log.servings);
            setMealType(log.meal_type);
        }
    }, [visible, log]);

    const baseCalories = log ? log.calories / log.servings : 0;
    const baseProtein = log ? log.protein_g / log.servings : 0;
    const baseCarbs = log ? log.carbs_g / log.servings : 0;
    const baseFat = log ? log.fat_g / log.servings : 0;


    const newCalories = Math.round(baseCalories * servings);
    const newProtein = Math.round(baseProtein * servings);
    const newCarbs = Math.round(baseCarbs * servings);
    const newFat = Math.round(baseFat * servings);

    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const SERVING_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

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

    const handleSave = () => {
        if (log) {
            onSave(log.id, { servings, meal_type: mealType });
            onClose();
        }
    };

    const handleDelete = () => {
        if (log) {
            Alert.alert(
                'Delete Entry',
                `Are you sure you want to delete "${log.food_item?.name}"?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Delete', 
                        style: 'destructive', 
                        onPress: () => {
                            onDelete(log.id);
                            onClose();
                        }
                    }
                ]
            );
        }
    };

    if (!log) return null;

    return (
        <Modal 
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={textColor} />
                    </TouchableOpacity>
                    
                    <Text style={[styles.headerTitle, { color: textColor }]}>
                        Edit Entry
                    </Text>
                    
                    <View style={styles.placeholder} />
                </View>

                {/* Food info */}
                <View style={[styles.foodInfo, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.foodName, { color: textColor }]}>
                        {log.food_item?.name ?? 'Unknown Food'}
                    </Text>
                    <Text style={[styles.foodCalories, { color: mutedColor }]}>
                        {newCalories} kcal
                    </Text>
                </View>

                {/* Servings Section */}
                <View style={[styles.section, { borderBottomColor: borderColor }]}>
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
                                {servings === 1 ? 'serving' : 'servings'}
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

                {/* Meal Type Section */}
                <View style={[styles.section, { borderBottomColor: borderColor }]}>
                    {/* Label + 4 buttons */}
                </View>

                {/* Nutrients Section */}
                <View style={[styles.section, { borderBottomColor: borderColor }]}>
                    {/* Label + grid of 4 items */}
                </View>

                {/* Footer buttons */}
                <View style={styles.footer}>
                    {/* Save, Delete buttons */}
                </View>
            </SafeAreaView>
            
        </Modal>
    );

}


const styles = StyleSheet.create({
    container: {
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
        width:  32,
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
    foodCalories: {
        fontSize: 14,
    },
    section: {
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
    footer: {},
});
