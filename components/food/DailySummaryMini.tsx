import { View, Text, StyleSheet } from "react-native";
import { Gradients } from '@/constants/Colors';
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { useThemeColor } from '@/hooks/useThemeColor';


interface DailySummaryMiniProps {
   consumed: number;
   goal: number;
   remaining: number;
}



export function DailySummaryMini({ consumed, goal, remaining }: DailySummaryMiniProps) {
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');

    const actualProgress = goal > 0 ? (consumed / goal) * 100 : 0; // Uncapped for logic
    const progress = Math.min(actualProgress, 100); // Capped for display
    const isOverGoal = remaining < 0;

    const gradientColors = isOverGoal
        ? Gradients.error
        : progress === 100
            ? Gradients.success
            : Gradients.info;

    return (
        <View style={styles.container}>
            <View>
                <ProgressRing progress={progress} size={56} gradientColors={gradientColors} strokeWidth={5} showPercentage={true}/>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>{goal.toLocaleString()}</Text>
                    <Text style={[styles.statLabel, { color: mutedColor }]}>Goal</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>{consumed.toLocaleString()}</Text>
                    <Text style={[styles.statLabel, { color: mutedColor }]}>Eaten</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>{remaining.toLocaleString()}</Text>
                    <Text style={[styles.statLabel, { color: mutedColor }]}>Remaining</Text>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginLeft: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    statLabel: {
        fontSize: 11,
        marginTop: 2,
    },
})