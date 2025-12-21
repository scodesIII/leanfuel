import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodSearchResult } from '@/types/food';

interface FoodSearchItemProps {
    item: FoodSearchResult;
    onPress: (item: FoodSearchResult) => void;
}

export const FoodSearchItem = ({ item, onPress }: FoodSearchItemProps) => {
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardColor = useThemeColor({}, 'card');
    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');

    // Format macros display "165 cal . 31g P . 3g C . 4g F"
    const macroText = [
        `${item.calories} cal`,
        `${item.protein_g}g P`,
        `${item.carbs_g}g C`,
        `${item.fat_g}g F`,
    ].join(' . ');
}
