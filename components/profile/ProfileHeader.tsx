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

    const displayName = profile?.display_name || profile?.full_name || 'User';
    const email = user?.email || 'No email';  

    return (
        <View style={styles.container}>
            {/* Avatar */}
            <View style={[styles.avatar, { borderColor }]}>
                <Text style={[styles.initials, { color: primaryColor }]}>
                    {getInitials()}
                </Text>
            </View>

            {/* Name */}
            <Text style={[styles.name, { color: textColor }]}>
                {displayName}
            </Text>

            {/* Email */}
            <Text style={[styles.email, { color: mutedColor }]}>
                {email}
            </Text>

            {/* Edit Profile Button */}
            <TouchableOpacity 
                style={[styles.editButton, { borderColor }]}
                onPress={() => console.log('Edit profile pressed')}
            >
                <Text style={[styles.editButtonText, { color: textColor }]}>
                    Edit Profile
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 24
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    initials: {
        fontSize: 32,
        fontWeight: '700',
    },
    name: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        opacity: 0.6,
        marginBottom: 16,
    },
    editButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    editButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
