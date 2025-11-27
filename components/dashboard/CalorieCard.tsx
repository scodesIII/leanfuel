
import { View, Text, StyleSheet } from "react-native"
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

    const getProgressColor = () => {
        if (progress > 100) return '#F44336'; // Red
        if (progress > 90) return '#FF9800'; // Orange
        return '#4CAF50'; // Green
    };


    return (
        <View style={[styles.container, { backgroundColor: cardColor }]} accessibilityLabel={`Calories: ${consumed} of ${goal} consumed`}>
            {/* Title */}
            <Text style={[styles.title, { color: textColor }]}>Today's Calories</Text>

            {/* Numbers: consumed / goal */}
            <Text style={[styles.numbers, { color: textColor }]}>
                {consumed.toLocaleString()} / {goal.toLocaleString()}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: getProgressColor() }]} />
            </View>

            {/* Remaining */}
            <Text style={[styles.remaining, { color: textColor }]}>
                {isOverGoal ? `${displayRemaining.toLocaleString()} over goal` : `${displayRemaining.toLocaleString()} remaining`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    progressBarBackground: {
        backgroundColor: '#E0E0E0',
        borderRadius: 12,
        overflow: 'hidden',
        height: 24,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
    },
    container: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    numbers: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
    },
    remaining: {
        fontSize: 14,
        opacity: 0.7,
    },
});
