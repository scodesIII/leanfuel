import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface WaterTrackerProps {
    consumed: number; // glasses consumed
    goal: number; // glasses goal (default 8)
    onAddGlass: () => void;
    onRemoveGlass?: () => void;
}

export function WaterTracker({ consumed, goal = 8, onAddGlass, onRemoveGlass }: WaterTrackerProps) {
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const glasses = Array.from({ length: goal }, (_, i) => i < consumed);

    return (
        <View style={[styles.container, { backgroundColor: cardColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleGroup}>
                    <Text style={styles.icon}>💧</Text>
                    <Text style={[styles.title, { color: mutedColor }]}>HYDRATION</Text>
                </View>
                <Text style={[styles.progress, { color: mutedColor }]}>
                    <Text style={{ color: textColor, fontWeight: '600' }}>{consumed}</Text> / {goal}
                </Text>
            </View>

            {/* Glasses */}
            <View style={styles.glassesRow}>
                {glasses.map((filled, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.glass,
                            filled 
                                ? { backgroundColor: primaryColor + '20', borderColor: primaryColor } 
                                : { backgroundColor: borderColor + '50', borderColor: 'transparent' }
                        ]}
                        onPress={() => filled && onRemoveGlass ? onRemoveGlass() : null}
                        disabled={!filled}
                    >
                        <Text style={styles.glassIcon}>{filled ? '💧' : '○'}</Text>
                    </TouchableOpacity>
                ))}

                {/* Add button */}
                <TouchableOpacity
                    style={[styles.glass, styles.addButton, { backgroundColor: primaryColor }]}
                    onPress={onAddGlass}
                >
                    <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 2,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        fontSize: 20,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.5,
    },
    progress: {
        fontSize: 14,
        fontVariant: ['tabular-nums'],
    },
    glassesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        gap: 8,
    },
    glass: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    glassIcon: {
        fontSize: 14,
    },
    addButton: {
        borderWidth: 0,
    },
    addIcon: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
});