import { View, StyleSheet } from 'react-native';
import { WeightCard } from './WeightCard';
import { WaterCard } from './WaterCard';
import { StepsCard } from './StepsCard';
// import { ActivityCard } from './ActivityCard'; 

export const ActivityGrid = () => {
    return (
        <View style={styles.container}>
            {/* Full Width Weight Card */}
            <WeightCard />

            {/* Half Width Cards Row */}
            <View style={styles.row}>
                {/* <WaterCard /> */}
                {/* <StepsCard /> */}
                {/* <ActivityCard /> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },

    row: {
        flexDirection: 'row',
        gap: 12,
    },
});
