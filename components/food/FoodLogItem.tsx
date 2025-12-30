import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FoodLog } from '@/stores/foodLogStore';



interface FoodLogItemProps {
    log: FoodLog;
    onDelete: (id: string) => void;
    onPress: (log: FoodLog) => void;
}

export function FoodLogItem({ log, onDelete, onPress }: FoodLogItemProps) {
    
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const cardColor = useThemeColor({}, 'card');

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

    const handleDelete = () => {
        // Haptic feedback for both platforms
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);        
        onDelete(log.id);
    };


    return (
        
            <TouchableOpacity
                style={[styles.container, { backgroundColor: cardColor, borderTopColor: borderColor }]}
                onPress={() => onPress(log)}
                onLongPress={handleDelete}
                delayLongPress={500}
                activeOpacity={0.7}
            >
                <View style={styles.leftContent}>
                    <Text style={[styles.foodName, { color: textColor }]}>
                        {log.food_item?.name ?? 'Unknown Food'}
                    </Text>
                    <Text style={[styles.meta, { color: mutedColor }]}>
                        {formatServings(log.servings)} · {formatTime(log.consumed_at)}
                    </Text>
                    <View style={styles.macroPills}>
                        <View style={[styles.pill, { backgroundColor: borderColor }]}>
                            <Text style={[styles.pillText, { color: mutedColor }]}>
                                P: {log.protein_g}g
                            </Text>
                        </View>
                        <View style={[styles.pill, { backgroundColor: borderColor }]}>
                            <Text style={[styles.pillText, { color: mutedColor }]}>
                                C: {log.carbs_g}g
                            </Text>
                        </View>
                        <View style={[styles.pill, { backgroundColor: borderColor }]}>
                            <Text style={[styles.pillText, { color: mutedColor }]}>
                                F: {log.fat_g}g
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.rightContent}>
                    <Text style={[styles.calories, { color: textColor }]}>
                        {log.calories}
                    </Text>
                    <Text style={[styles.chevron, { color: mutedColor }]}>›</Text>
                </View>
            </TouchableOpacity>
       
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
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    calories: {
        fontSize: 14,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    chevron: {
        fontSize: 20,
        fontWeight: '300',
    },
});