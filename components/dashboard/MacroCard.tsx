import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

interface MacroCardProps {
    label: string;      // "CARBS", "PROTEIN", "FAT"
    consumed: number;   // grams consumed
    goal: number;       // daily goal in grams
    color: string;      // theme color
}

export const MacroCard = ({ label, consumed, goal, color }: MacroCardProps) => {
    const progress = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
    const isOver = consumed > goal;
    const remaining = goal - consumed;

    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');

    // Animations
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const barWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 40,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(barWidth, {
                toValue: progress,
                duration: 1000,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                useNativeDriver: false,
            }),
        ]).start();
    }, [progress]);

    const barWidthInterpolated = barWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    // Get lighter shade for secondary elements
    const getLighterColor = (hex: string) => {
        return hex + '30'; // 30 = 18% opacity
    };

    // Get icon based on macro type
    const getIcon = () => {
        switch (label.toUpperCase()) {
            case 'CARBS': return '🌾';
            case 'PROTEIN': return '🥩';
            case 'FAT': return '🥑';
            default: return '📊';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: cardColor,
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            {/* Gradient background overlay */}
            <View style={styles.gradientOverlay}>
                <LinearGradient
                    colors={[getLighterColor(color), 'rgba(0,0,0,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* Header with icon and label */}
            <View style={styles.header}>
                <View style={[styles.iconBadge, { backgroundColor: color + '15' }]}>
                    <Text style={styles.icon}>{getIcon()}</Text>
                </View>
                <Text style={[styles.label, { color: mutedColor }]}>
                    {label}
                </Text>
            </View>

            {/* Numbers with emphasis */}
            <View style={styles.numbersContainer}>
                <View style={styles.consumedRow}>
                    <Text style={[styles.consumed, { color: textColor }]}>
                        {Math.round(consumed)}
                    </Text>
                    <Text style={[styles.unit, { color: mutedColor }]}>g</Text>
                </View>
                <Text style={[styles.goal, { color: mutedColor }]}>
                    / {goal}g
                </Text>
            </View>

            {/* Horizontal Progress Bar */}
            <View style={styles.horizontalBarContainer}>
                <View style={[styles.horizontalBarBackground, { backgroundColor: color + '10' }]}>
                    <Animated.View style={{ width: barWidthInterpolated }}>
                        <LinearGradient
                            colors={[color, color + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.horizontalBarFill}
                        />
                    </Animated.View>
                </View>
            </View>

            {/* Status indicator */}
            {isOver ? (
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: '#FF4757' }]} />
                    <Text style={[styles.statusText, { color: '#FF4757' }]}>
                        +{Math.round(consumed - goal)}g
                    </Text>
                </View>
            ) : remaining <= goal * 0.1 && remaining > 0 ? (
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: '#FFB84D' }]} />
                    <Text style={[styles.statusText, { color: mutedColor }]}>
                        {Math.round(remaining)}g left
                    </Text>
                </View>
            ) : (
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={[styles.statusText, { color: mutedColor }]}>
                        {Math.round(remaining)}g left
                    </Text>
                </View>
            )}

            {/* Celebration for 100% */}
            {progress === 100 && !isOver && (
                <View style={[styles.celebrationBadge, { backgroundColor: color + '20' }]}>
                    <Text style={styles.celebrationEmoji}>✓</Text>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: 110,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
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
            default: {},
        }),
    },

    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        overflow: 'hidden',
        pointerEvents: 'none',
    },

    header: {
        alignItems: 'center',
        marginBottom: 12,
    },

    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },

    icon: {
        fontSize: 16,
    },

    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },

    numbersContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },

    consumedRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    consumed: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    unit: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 2,
        opacity: 0.5,
    },

    goal: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 2,
        fontWeight: '500',
    },

    horizontalBarContainer: {
        width: '100%',
        marginBottom: 12,
    },

    horizontalBarBackground: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },

    horizontalBarFill: {
        height: '100%',
        borderRadius: 4,
    },

    percentage: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.3,
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.04)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        gap: 4,
    },

    statusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },

    statusText: {
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 0.2,
    },

    celebrationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    celebrationEmoji: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});

// ============================================================================
// DESIGN BREAKDOWN - HORIZONTAL BAR DESIGN
// ============================================================================

/*
DESIGN PHILOSOPHY:
==================
This design prioritizes VISUAL HIERARCHY over visual complexity.
- CalorieCard: Large ring (PRIMARY metric)
- MacroCards: Horizontal bars (SECONDARY metrics)

INDUSTRY INSPIRATION:
=====================
• MyFitnessPal: Horizontal bars for macros
• Cronometer: Simple bar progress
• Lose It: Clean macro display
• Noom: Minimal, scannable design

KEY IMPROVEMENTS:
=================
1. CLEAR HIERARCHY
   - Removed circular ring (reserved for CalorieCard)
   - Horizontal bar is visually secondary
   - Easier to distinguish primary vs secondary data

2. BETTER SCANNABILITY
   - Numbers are prominent (28pt consumed)
   - Progress bar is simple and clear
   - Percentage displayed as text
   - Less cognitive load

3. COMPACT DESIGN
   - Smaller cards (110px min-width vs 120px)
   - Fits 3 across comfortably
   - Less vertical space needed
   - Cleaner overall dashboard

4. PREMIUM POLISH
   - Smooth gradient bar fill
   - Spring entrance animation
   - Icon badges with color tint
   - Status badges with dynamic colors

ANIMATION SEQUENCE:
===================
1. Fade in + scale up (400ms)
2. Bar fills left-to-right (1000ms)
Total: 1.4 seconds

LAYOUT:
=======
[Icon Badge]
   LABEL
   
  128g
  / 200g
  
[=========>  ] 64%

  • 72g left

CUSTOMIZATION:
==============
• Bar height: 8px (styles.horizontalBarBackground)
• Numbers size: 28pt (styles.consumed)
• Card width: 110px min (styles.container)
• Animation speed: 1000ms (barWidth animation)
*/