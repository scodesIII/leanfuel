import { FoodLog } from '@/stores/foodLogStore';
import { MealType } from '@/types/food';



interface EditFoodLogModalProps {
    visible: boolean;
    log: FoodLog | null;
    onClose: () => void;
    onSave: (id: string, updates: { servings: number; meal_type: MealType }) => void;
    onDelete: (id: string) => void;
}