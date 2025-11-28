import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import { useRef, useEffect } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface CalorieCardProps {
    consumed: number;
    goal: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CalorieCard = ({ consumed, goal }: CalorieCardProps) => {
    const progress = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
    const remaining = goal - consumed;
    const isOverGoal = remaining < 0;
    const displayRemaining = Math.abs(remaining);

    // Theme colors
    const cardColor = useThemeColor({}, "card");
    const textColor = useThemeColor({}, "text");
    const mutedColor = useThemeColor({}, "muted");
    
    const successColor = useThemeColor({}, "success");
    const errorColor = useThemeColor({}, "error");
    const infoColor = useThemeColor({}, "info");

    // Apple Fitness-style ring animation
    const ringProgress = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current; // Start at full scale
    const opacityAnim = useRef(new Animated.Value(1)).current; // Start visible

    // Ring progress animation - updates when progress changes
    useEffect(() => {
        Animated.timing(ringProgress, {
            toValue: progress,
            duration: 2000, // Slowed down for better visibility
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false, // SVG animations don't support native driver
        }).start();
    }, [progress]);

    // Calculate ring stroke
    const size = 180;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const strokeDashoffset = ringProgress.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    // Helper to create gradient variations from a base color
    const createGradient = (baseColor: string) => {
        // For now, use the same color for all gradient stops
        // Could be enhanced to generate lighter/darker variations
        return [baseColor, baseColor, baseColor];
    };

    // Determine gradient colors based on progress using theme colors
    const getGradientColors = () => {
        if (isOverGoal) {
            return createGradient(errorColor); // Red - over goal
        } else if (progress === 100) {
            return createGradient(successColor); // Green - goal met
        } else {
            return createGradient(infoColor); // Blue - on track
        }
    };

    const gradientColors = getGradientColors();

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
            {/* Subtle gradient overlay for depth */}
            <View style={styles.gradientOverlay}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* Header with Whoop-style minimal typography */}
            <View style={styles.header}>
                <Text style={[styles.label, { color: mutedColor }]}>
                    DAILY CALORIES
                </Text>
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: gradientColors[1] }]} />
                    <Text style={[styles.statusText, { color: mutedColor }]}>
                        {isOverGoal ? 'OVER' : progress === 100 ? 'GOAL MET' : progress > 90 ? 'CLOSE' : 'ON TRACK'}
                    </Text>
                </View>
            </View>

            {/* Apple Fitness Ring */}
            <View style={styles.ringContainer}>
                <Svg width={size} height={size} style={styles.ring}>
                    <Defs>
                        <SvgLinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="1" />
                            <Stop offset="50%" stopColor={gradientColors[1]} stopOpacity="1" />
                            <Stop offset="100%" stopColor={gradientColors[2]} stopOpacity="1" />
                        </SvgLinearGradient>
                    </Defs>

                    {/* Background ring */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(0,0,0,0.08)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    {/* Progress ring with gradient */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#ringGradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>

                {/* Center content - Noom-style large numbers */}
                <View style={styles.ringCenter}>
                    <Text style={[styles.mainNumber, { color: textColor }]}>
                        {consumed.toLocaleString()}
                    </Text>
                    <View style={styles.divider} />
                    <Text style={[styles.goalNumber, { color: mutedColor }]}>
                        {goal.toLocaleString()}
                    </Text>
                    <Text style={[styles.unit, { color: mutedColor }]}>
                        kcal
                    </Text>
                </View>
            </View>

            {/* Progress percentage badge */}
            <View style={styles.progressBadge}>
                <LinearGradient
                    colors={[gradientColors[0] + '20', gradientColors[1] + '15']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressBadgeGradient}
                >
                    <Text style={[styles.progressPercent, { color: gradientColors[1] }]}>
                        {Math.round(progress)}%
                    </Text>
                </LinearGradient>
            </View>

            {/* Bottom info - Cronometer style */}
            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Text style={[styles.footerValue, { color: isOverGoal ? '#FF4757' : gradientColors[1] }]}>
                        {displayRemaining.toLocaleString()}
                    </Text>
                    <Text style={[styles.footerLabel, { color: mutedColor }]}>
                        {isOverGoal ? 'over goal' : 'remaining'}
                    </Text>
                </View>

                {/* Micro progress bar */}
                <View style={styles.microBar}>
                    <View style={[styles.microBarBg, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                        <Animated.View
                            style={[
                                styles.microBarFill,
                                {
                                    width: `${Math.min(progress, 100)}%`,
                                    backgroundColor: gradientColors[1],
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* Milestone indicator */}
                {progress >= 50 && progress < 100 && (
                    <View style={styles.milestoneContainer}>
                        <View style={[styles.milestoneDot, { backgroundColor: gradientColors[1] }]} />
                        <Text style={[styles.milestoneText, { color: mutedColor }]}>
                            Halfway there! 🎯
                        </Text>
                    </View>
                )}

                {progress >= 100 && !isOverGoal && (
                    <View style={styles.milestoneContainer}>
                        <View style={[styles.milestoneDot, { backgroundColor: '#4CAF50' }]} />
                        <Text style={[styles.milestoneText, { color: mutedColor }]}>
                            Goal reached! 🎉
                        </Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 28,
        borderRadius: 24,
        marginBottom: 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
            },
            android: {
                elevation: 6,
            },
            default: {},
        }),
    },

    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'none',
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },

    label: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.5,
        textTransform: "uppercase",
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },

    statusText: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.8,
    },

    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        position: 'relative',
    },

    ring: {
        transform: [{ rotate: '0deg' }],
    },

    ringCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },

    mainNumber: {
        fontSize: 42,
        fontWeight: '700',
        letterSpacing: -1,
        lineHeight: 48,
    },

    divider: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 4,
    },

    goalNumber: {
        fontSize: 20,
        fontWeight: '600',
        opacity: 0.6,
        letterSpacing: -0.5,
    },

    unit: {
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 2,
        opacity: 0.5,
    },

    progressBadge: {
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },

    progressBadgeGradient: {
        paddingHorizontal: 16,
        paddingVertical: 6,
    },

    progressPercent: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    footer: {
        gap: 12,
    },

    footerItem: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 8,
    },

    footerValue: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },

    footerLabel: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
    },

    microBar: {
        marginTop: 4,
    },

    microBarBg: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },

    microBarFill: {
        height: '100%',
        borderRadius: 2,
    },

    milestoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 6,
    },

    milestoneDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    milestoneText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});