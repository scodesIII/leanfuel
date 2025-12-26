import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

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

interface FoodLogItemProps {
    log: FoodLog;
}

export function FoodLogItem({ log }: FoodLogItemProps) {
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const surfaceColor = useThemeColor({}, 'background');

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatServings = (servings: number) => {
        if (servings === 1) return '1 serving';
        return `${servings} servings`;
    };

    return (
        <View style={[styles.container, { borderTopColor: borderColor }]}>
            <View style={styles.leftContent}>
                {/* Food Name */}
                <Text style={[styles.foodName, { color: textColor }]}>
                    {log.food_item?.name ?? 'Unknown Food'}
                </Text>

                {/* Meta: servings + time */}
                <Text style={[styles.meta, { color: mutedColor }]}>
                    {formatServings(log.servings)} · {formatTime(log.consumed_at)}
                </Text>

                {/* Macro Pills */}
                <View style={styles.macroPills}>
                    <View style={[styles.pill, { backgroundColor: surfaceColor }]}>
                        <Text style={[styles.pillText, { color: mutedColor }]}>
                            P: {log.protein_g}g
                        </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: surfaceColor }]}>
                        <Text style={[styles.pillText, { color: mutedColor }]}>
                            C: {log.carbs_g}g
                        </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: surfaceColor }]}>
                        <Text style={[styles.pillText, { color: mutedColor }]}>
                            F: {log.fat_g}g
                        </Text>
                    </View>
                </View>
            </View>

            {/* Calories */}
            <Text style={[styles.calories, { color: textColor }]}>
                {log.calories}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopWidth: 1,
    },
    leftContent: {
        flex: 1,
        marginRight: 12,
    },
    foodName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    meta: {
        fontSize: 12,
        marginBottom: 6,
    },
    macroPills: {
        flexDirection: 'row',
        gap: 8,
    },
    pill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    pillText: {
        fontSize: 11,
        fontWeight: '500',
    },
    calories: {
        fontSize: 14,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
});