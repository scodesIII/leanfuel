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


    return (
        <Pressable
            onPress={() => onPress(item)}
            style={({ pressed }) => [
                styles.container,
                { 
                    backgroundColor: cardColor,
                    borderBottomColor: borderColor,
                    opacity: pressed ? 0.7 : 1,
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text 
                        style={[styles.name, { color: textColor }]}
                        numberOfLines={1}
                    >
                        {item.name}
                        {item.is_verified && ' ✓'}
                    </Text>
                    <Text style={[styles.details, { color: mutedColor }]}>
                        {item.brand && `${item.brand} • `}
                        {item.serving_size}{item.serving_unit}
                    </Text>
                    <Text style={[styles.macros, { color: mutedColor }]}>
                        {macroText}
                    </Text>
                </View>

                <View style={[styles.addButton, { backgroundColor: primaryColor + '15' }]}>
                    <Plus size={20} color={primaryColor} />
                </View>
            </View>
        </Pressable>
    );
}


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    details: {
        fontSize: 13,
        marginBottom: 2,
    },
    macros: {
        fontSize: 12,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
