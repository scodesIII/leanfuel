import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState } from 'react';

interface WeightEntry {
    day: string;
    weight: number;
}

export const WeightCard = () => {
    // Mock data - replace with real data from Supabase later
    const [currentWeight] = useState(68.5);
    const [weightChange] = useState(-0.5); // Change from last week

    // Last 7 days data (most recent on right)
    const [weekData] = useState<WeightEntry[]>([
        { day: 'M', weight: 69.5 },
        { day: 'T', weight: 69.2 },
        { day: 'W', weight: 69.0 },
        { day: 'T', weight: 68.8 },
        { day: 'F', weight: 68.7 },
        { day: 'S', weight: 68.6 },
        { day: 'S', weight: 68.5 },
    ]);

    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');

    // Calculate bar heights (normalize to max)
    const maxWeight = Math.max(...weekData.map(d => d.weight));
    const minWeight = Math.min(...weekData.map(d => d.weight));
    const range = maxWeight - minWeight || 1;

    const getBarHeight = (weight: number) => {
        const normalized = (weight - minWeight) / range;
        return 30 + (normalized * 30); // Between 30-60 pixels
    };

    const isPositive = weightChange >= 0;
    const trendIcon = weightChange < -0.3 ? '↓' : weightChange > 0.3 ? '↑' : '→';
    const trendColor = weightChange < 0 ? '#22c55e' : weightChange > 0 ? '#ef4444' : '#94a3b8';

    return (
        <View style={[styles.card, { backgroundColor: cardColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.statsLeft}>
                    <Text style={[styles.currentWeight, { color: textColor }]}>
                        {currentWeight} kg
                    </Text>
                    <View style={styles.changeContainer}>
                        <Text style={[styles.changeText, { color: trendColor }]}>
                            {trendIcon} {Math.abs(weightChange)} kg
                        </Text>
                        <Text style={[styles.changePeriod, { color: mutedColor }]}>
                            this week
                        </Text>
                    </View>
                </View>

                {/* Add Weight Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.addButtonPressed
                    ]}
                    onPress={() => {
                        // TODO: Navigate to weight logging component
                        console.log('Navigate to log weight');
                    }}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </Pressable>
            </View>

            {/* 7-Day Chart */}
            <View style={styles.chartSection}>
                <Text style={[styles.chartTitle, { color: mutedColor }]}>
                    Last 7 days:
                </Text>

                <View style={styles.chartContainer}>
                    {weekData.map((entry, index) => {
                        const height = getBarHeight(entry.weight);
                        return (
                            <View key={index} style={styles.barColumn}>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height,
                                                backgroundColor: index === weekData.length - 1
                                                    ? '#3b82f6'
                                                    : 'rgba(59, 130, 246, 0.3)'
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.dayLabel, { color: mutedColor }]}>
                                    {entry.day}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Trend Indicator */}
                <View style={styles.trendContainer}>
                    <Text style={[styles.trendText, { color: trendColor }]}>
                        {weightChange < 0 ? 'Trending down' : weightChange > 0 ? 'Trending up' : 'Stable'} {trendIcon}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
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

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },

    statsLeft: {
        flex: 1,
    },

    currentWeight: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 6,
    },

    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    changeText: {
        fontSize: 14,
        fontWeight: '600',
    },

    changePeriod: {
        fontSize: 12,
        opacity: 0.6,
    },

    // Add Button
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#3b82f6',
                shadowOpacity: 0.3,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
            },
            android: {
                elevation: 4,
            },
        }),
    },

    addButtonPressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.8,
    },

    addButtonText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        lineHeight: 24,
    },

    // Chart Section
    chartSection: {
        marginTop: 8,
    },

    chartTitle: {
        fontSize: 12,
        marginBottom: 12,
        opacity: 0.7,
    },

    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 80,
        marginBottom: 8,
    },

    barColumn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },

    barContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 60,
        marginBottom: 6,
    },

    bar: {
        width: '70%',
        borderRadius: 4,
        minHeight: 4,
    },

    dayLabel: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.6,
    },

    trendContainer: {
        alignItems: 'center',
        marginTop: 8,
    },

    trendText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
