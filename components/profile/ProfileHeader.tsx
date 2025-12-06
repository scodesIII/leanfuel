import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserStore } from '@/stores/userStore';
import { useEffect } from 'react';


export function ProfileHeader() {
    const { profile, user } = useUserStore();


    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const backgroundColor = useThemeColor({}, 'background');

    // Get user initials from name
    const getInitials = () => {
        if (!profile?.display_name && !profile?.full_name) return '?';
        const name = profile?.display_name || profile?.full_name || '';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();

        }
        return name[0]?.toUpperCase() || '?';
    }

    useEffect(() => {
        console.log("ProfileHeader mounted");
        console.log("Initials:", getInitials());
    }, []);    

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <Text style={[styles.title, { color: textColor }]}>
                Profile Screen
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
                We'll build this together! 🚀
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
    },
});
