import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ProfileScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor }]}
            contentContainerStyle={styles.content}
        >
            <Text style={[styles.title, { color: textColor }]}>
                Profile Screen
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
                We'll build this together! 🚀
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.6,
    },
});