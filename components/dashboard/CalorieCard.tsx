
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native"
import { useRef, useEffect } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CalorieCardProps {
    consumed: number;
    goal: number;
}


export const CalorieCard = ({ consumed, goal }: CalorieCardProps) => {
    const progress = goal > 0 ? (consumed / goal) * 100 : 0;
    const remaining = goal - consumed;
    const isOverGoal = remaining < 0;
    const displayRemaining = Math.abs(remaining);


    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');
    const mutedColor = useThemeColor({}, 'muted');

    const getProgressColor = () => {
        if (progress > 100) return '#F44336'; // Red
        if (progress > 90) return '#FF9800'; // Orange
        return '#4CAF50'; // Green
    };

    // Progress animation
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: Math.min(progress, 100),
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const barColor = isOverGoal
        ? "#F44336"
        : progress > 90
            ? "#FF9800"
            : "#4CAF50";


    return (
        <View style={[styles.container, { backgroundColor: cardColor }, styles.shadow]} accessibilityLabel={`Calories: ${consumed} of ${goal} consumed`}>
            {/* Title */}
            <Text style={[styles.title, { color: mutedColor }]}>Today's Calories</Text>

            {/* Numbers: consumed / goal */}
            <View style={styles.row}>
                <Text style={[styles.consumed, { color: textColor }]}>
                    {consumed.toLocaleString()}
                </Text>
                <Text style={[styles.goal, { color: mutedColor }]}>
                    / {goal.toLocaleString()}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarBackground, { backgroundColor: mutedColor + "33" }]}>
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        {
                            backgroundColor: barColor,
                            width: animatedWidth.interpolate({
                                inputRange: [0, 100],
                                outputRange: ["0%", "100%"],
                            }),
                        },
                    ]}
                />
            </View>

            {/* Remaining */}
            <Text
                style={[
                    styles.remaining,
                    { color: isOverGoal ? "#F44336" : mutedColor },
                ]}
            >
                {isOverGoal
                    ? `${displayRemaining.toLocaleString()} over goal`
                    : `${displayRemaining.toLocaleString()} remaining`}
            </Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    shadow: Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 4 },
        },
        android: {
            elevation: 3,
        },
        default: {},
    }),
    title: {
        fontSize: 14,
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 12,
    },
    consumed: {
        fontSize: 36,
        fontWeight: "700",
        marginRight: 4,
    },
    goal: {
        fontSize: 18,
        opacity: 0.7,
    },
    progressBarBackground: {
        height: 10,
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 10,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 6,
    },
    remaining: {
        fontSize: 14,
        fontWeight: "500",
    },
});
