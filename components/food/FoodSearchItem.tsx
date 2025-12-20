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
}
