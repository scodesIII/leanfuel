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
        <Modal visible={visible}>
            <Text>Edit Modal Placeholder</Text>
        </Modal>
    );

}