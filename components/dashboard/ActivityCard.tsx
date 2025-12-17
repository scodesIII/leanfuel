import { View, Text, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState } from 'react';

export const ActivityCard = () => {
    const [activeMinutes] = useState(45);
    const goal = 60;
    const percentage = (activeMinutes / goal) * 100;

    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');

    return (
        <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={styles.icon}>🔥</Text>
            <Text style={[styles.label, { color: mutedColor }]}>Activity</Text>

            <View style={styles.valueContainer}>
                <Text style={[styles.value, { color: textColor }]}>
                    {activeMinutes}
                </Text>
                <Text style={[styles.unit, { color: mutedColor }]}>
                    / {goal} min
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${Math.min(percentage, 100)}%`, backgroundColor: '#ef4444' }
                    ]}
                />
            </View>

            <Text style={[styles.subtext, { color: mutedColor }]}>
                {goal - activeMinutes} min left
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 4,
            },
        }),
    },

    icon: {
        fontSize: 32,
        marginBottom: 8,
    },

    label: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        opacity: 0.6,
    },

    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },

    value: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    unit: {
        fontSize: 12,
        marginLeft: 4,
        opacity: 0.5,
    },

    progressBar: {
        height: 4,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: 12,
    },

    progressFill: {
        height: '100%',
        borderRadius: 999,
    },

    subtext: {
        fontSize: 11,
        marginTop: 8,
        opacity: 0.6,
    },
});
