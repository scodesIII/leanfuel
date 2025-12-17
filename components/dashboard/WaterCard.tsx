import { View, Text, StyleSheet, Pressable, Platform, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/superbase';
import * as Haptics from 'expo-haptics';

interface WaterSummary {
    total_ml: number;
    goal_ml: number;
    percentage: number;
}

interface LogWaterResponse {
    success: boolean;
    water_log_id: string;
    amount_ml: number;
    total_ml: number;
    goal_ml: number;
    percentage: number;
}

export const WaterCard = () => {
    const [waterData, setWaterData] = useState<WaterSummary>({
        total_ml: 0,
        goal_ml: 2000,
        percentage: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [recentAdd, setRecentAdd] = useState<number | null>(null);

    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;

    const fetchWaterData = async () => {
        try {
            const { data, error } = await supabase.rpc('get_todays_water');
            if (error) throw error;

            if (data) {
                const summary = data as WaterSummary;
                setWaterData(summary);
            }
        } catch (error) {
            console.error('Water fetch error:', error);
        }
    };

    const addWater = async (amount_ml: number) => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const { data, error } = await supabase.rpc('log_water', {
                p_amount_ml: amount_ml,
                p_container_type: amount_ml === 250 ? 'glass' : amount_ml === 500 ? 'bottle' : 'liter',
            });

            if (error) throw error;

            const response = data as LogWaterResponse;
            setWaterData({
                total_ml: response.total_ml,
                goal_ml: response.goal_ml,
                percentage: response.percentage,
            });

            // Success feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowSuccess(true);
            setRecentAdd(amount_ml);

            // Animate
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(successOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Hide success message
            setTimeout(() => {
                Animated.timing(successOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    setShowSuccess(false);
                    setRecentAdd(null);
                });
            }, 1500);

        } catch (error) {
            console.error('Water log error:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWaterData();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor: cardColor, transform: [{ scale: scaleAnim }] }
            ]}
        >
            {/* Success Overlay */}
            {showSuccess && (
                <Animated.View
                    style={[
                        styles.successOverlay,
                        { opacity: successOpacity }
                    ]}
                >
                    <Text style={styles.successIcon}>✓</Text>
                    <Text style={styles.successText}>+{recentAdd}ml</Text>
                </Animated.View>
            )}

            <Text style={styles.icon}>💧</Text>
            <Text style={[styles.label, { color: mutedColor }]}>Water</Text>

            <View style={styles.valueContainer}>
                <Text style={[styles.value, { color: textColor }]}>
                    {waterData.total_ml}
                </Text>
                <Text style={[styles.unit, { color: mutedColor }]}>ml</Text>
            </View>

            {/* Dot Progress Indicators */}
            <View style={styles.dotContainer}>
                {[...Array(8)].map((_, index) => {
                    const glassesConsumed = Math.floor(waterData.total_ml / 250);
                    const isFilled = index < glassesConsumed;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                isFilled ? styles.dotFilled : styles.dotEmpty,
                            ]}
                        />
                    );
                })}
            </View>
            <Text style={[styles.progressText, { color: mutedColor }]}>
                {Math.floor(waterData.total_ml / 250)} of 8 glasses
            </Text>

            {/* Quick Add Buttons */}
            <View style={styles.buttonRow}>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={() => addWater(250)}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>+250</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={() => addWater(500)}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>+500</Text>
                </Pressable>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        position: 'relative',
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

    // Dot Progress Indicators
    dotContainer: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
        marginTop: 8,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    dotFilled: {
        backgroundColor: '#3b82f6',
    },

    dotEmpty: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },

    progressText: {
        fontSize: 11,
        marginBottom: 12,
        opacity: 0.7,
    },

    buttonRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
    },

    button: {
        flex: 1,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },

    buttonPressed: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        transform: [{ scale: 0.97 }],
    },

    buttonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
    },

    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(34, 197, 94, 0.95)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    successIcon: {
        fontSize: 40,
        color: '#fff',
        marginBottom: 4,
    },

    successText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
