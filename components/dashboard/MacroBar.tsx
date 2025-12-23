import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';

interface MacroBarProps {
    label: string;
    consumed: number;
    goal: number;
    color: string;
    icon: string;
}

export function MacroBar({ label, consumed, goal, color, icon }: MacroBarProps) {
    const progress = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
    const isOver = consumed > goal;

    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    // Create lighter shade for icon background
    const iconBgColor = color + '15'; // 15 = ~8% opacity

    return (
        <View style={styles.container}>
            {/* Header row */}
            <View style={styles.header}>
                <View style={styles.labelGroup}>
                    <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                        <Text style={styles.icon}>{icon}</Text>
                    </View>
                    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
                </View>
                <View style={styles.valuesContainer}>
                    <Text style={[styles.consumed, { color: isOver ? '#EF4444' : textColor }]}>
                        {consumed}
                    </Text>
                    <Text style={[styles.goal, { color: mutedColor }]}> / {goal}g</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.track, { backgroundColor: borderColor }]}>
                <View style={[styles.fillContainer, { width: `${progress}%` }]}>
                    <LinearGradient
                        colors={[color, color + 'CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.fill}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    labelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 18,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
    },
    valuesContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    consumed: {
        fontSize: 15,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    goal: {
        fontSize: 14,
    },
    track: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    fillContainer: {
        height: '100%',
    },
    fill: {
        flex: 1,
        borderRadius: 4,
    },
});