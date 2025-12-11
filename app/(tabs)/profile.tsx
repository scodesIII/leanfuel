import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from '@/components/profile/ProfileHeader';


export default function ProfileScreen() {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.content}
            >
            <ProfileHeader />
            </ScrollView>
        </SafeAreaView>
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