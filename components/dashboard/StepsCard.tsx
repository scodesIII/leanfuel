import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export const StepsCard = () => {
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');

    return (
        <View style={[styles.card, { backgroundColor: cardColor }]}>
            <Text style={styles.icon}>👟</Text>
            <Text style={[styles.label, { color: mutedColor }]}>Steps</Text>

            {/* Empty State */}
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📱</Text>
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                    No data yet
                </Text>
                <Text style={[styles.emptyMessage, { color: mutedColor }]}>
                    Connect your fitness app to track steps
                </Text>
            </View>

            {/* Connect Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.connectButton,
                    pressed && styles.connectButtonPressed
                ]}
                onPress={() => {
                    // TODO: Navigate to app connections screen
                    console.log('Navigate to connect fitness app');
                }}
            >
                <Text style={styles.connectButtonText}>Connect App</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        justifyContent: 'space-between',
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
        marginBottom: 16,
        opacity: 0.6,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20,
        flex: 1,
        justifyContent: 'center',
    },

    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
        opacity: 0.4,
    },

    emptyTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },

    emptyMessage: {
        fontSize: 11,
        textAlign: 'center',
        opacity: 0.6,
        lineHeight: 16,
    },

    // Connect Button
    connectButton: {
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },

    connectButtonPressed: {
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        transform: [{ scale: 0.97 }],
    },

    connectButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#f97316',
    },
});
