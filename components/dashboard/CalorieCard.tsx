import { View, Text, StyleSheet, Platform } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressRing } from './ProgressRing';
import { Gradients } from '@/constants/Colors';

interface CalorieCardProps {
    consumed: number;
    goal: number;
}

export const CalorieCard = ({ consumed, goal }: CalorieCardProps) => {
    const progress = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
    const remaining = goal - consumed;
    const isOverGoal = remaining < 0;
    const displayRemaining = Math.abs(remaining);

    // Theme colors
    const cardColor = useThemeColor({}, "card");
    const textColor = useThemeColor({}, "text");
    const mutedColor = useThemeColor({}, "muted");

    // Determine gradient colors based on progress
    const gradientColors = isOverGoal
        ? Gradients.error
        : progress === 100
            ? Gradients.success
            : Gradients.info;

    // Get status text based on progress
    const getStatus = () => {
        if (progress === 0) return 'NOT STARTED';
        if (progress <= 10) return 'GETTING STARTED';
        if (progress > 90 && progress < 100) return 'CLOSE';
        if (progress === 100) return 'GOAL MET';
        if (isOverGoal) return 'OVER';
        return 'ON TRACK';
    };

    const status = getStatus();

    // Get milestone message based on progress
    const getMilestone = () => {
        if (progress >= 100 && !isOverGoal) {
            return { text: 'Goal reached! 🎉', color: Gradients.success[1] };
        }
        if (progress >= 45 && progress <= 55) {
            return { text: 'Halfway there! 🎯', color: gradientColors[1] };
        }
        return null;
    };

    const milestone = getMilestone();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: cardColor }
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
                        {status}
                    </Text>
                </View>
            </View>


            {/* Apple Fitness Ring */}
            <View style={styles.ringWrapper}>
                <ProgressRing progress={progress} size={180} gradientColors={gradientColors}>
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
                </ProgressRing>
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


                {/* Milestone indicator */}
                {milestone && (
                    <View style={styles.milestoneContainer}>
                        <View style={[styles.milestoneDot, { backgroundColor: milestone.color }]} />
                        <Text style={[styles.milestoneText, { color: mutedColor }]}>
                            {milestone.text}
                        </Text>
                    </View>
                )}
            </View>
        </View>
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

    ringWrapper: {
        alignItems: 'center',
        width: '100%',
    },

    ringCenter: {
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