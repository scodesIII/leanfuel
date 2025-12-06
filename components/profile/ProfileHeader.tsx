import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUserStore } from '@/stores/userStore';


export function ProfileHeader() {
    const { profile, user } = useUserStore();


    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');
    const backgroundColor = useThemeColor({}, 'background');

    

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