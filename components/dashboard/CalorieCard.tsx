
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
        <View style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Today's Calories</Text>
    
            {/* Numbers: consumed / goal */}
            <Text style={styles.numbers}>{consumed} / {goal}</Text>
    
            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
    
            {/* Remaining */}
            <Text style={styles.remaining}>
                {isOverGoal ? `${displayRemaining} over goal` : `${displayRemaining} remaining`}
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
        backgroundColor: '#4CAF50',
        height: '100%',
    },
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
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
        color: '#666',
    },
});
