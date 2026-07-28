import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEffect, useState } from 'react';
import { LogWeightModal } from '../weight/LogWeightModal';
import { useUserStore } from '@/stores/userStore';
import { useWeightStore } from '@/stores/weightStore';
import { kgToDisplay, unitLabel } from '@/utils/units';
import { formatLongDate } from '@/lib/date';



export const WeightCard = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const profile = useUserStore(state => state.profile);
    const { latest, fetchLatest } = useWeightStore();

    useEffect(() => {
        fetchLatest();
    }, []);

    const units = profile?.preferred_units ?? 'metric';
    const weightKg = latest?.weight ?? null;

    const displayWeight = weightKg != null
        ? `${kgToDisplay(weightKg, units)} ${unitLabel(units)}`
        : '—';

    const dateText = latest?.date ? formatLongDate(latest.date) : 'No weight logged yet';

    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');



    return (
        <>
            <View style={[styles.card, { backgroundColor: cardColor }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.statsLeft}>
                        <Text style={[styles.currentWeight, { color: textColor }]}>
                            {displayWeight}
                        </Text>
                        <Text style={[styles.dateText, { color: mutedColor }]}>
                            {dateText}
                        </Text>
                    </View>

                    {/* Add Weight Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.addButton,
                            pressed && styles.addButtonPressed
                        ]}
                        onPress={() => {
                            setModalOpen(true);
                        }}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </Pressable>
                </View>   
            </View>
            <LogWeightModal
                    visible={modalOpen}
                    onClose={() => setModalOpen(false)}
            />   
        </>
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

    // Add Button
    addButton: {
        flex: 1,
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
        display: 'flex',
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
    },

    dateText: {
        fontSize: 14,
        fontWeight: '400',
    },
});
