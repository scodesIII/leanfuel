import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DateNavigatorProps {
    label: string;
    subLabel: string;
    isToday: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export const DateNavigator = ({
    label,
    subLabel,
    isToday,
    onPrevious,
    onNext,
}: DateNavigatorProps) => {
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View style={styles.container}>
            {/* Previous */}
            <TouchableOpacity
                style={[styles.arrowButton, { backgroundColor, borderColor }]}
                onPress={onPrevious}
                activeOpacity={0.7}
            >
                <ChevronLeft size={22} color={textColor} />
            </TouchableOpacity>

            {/* Center */}
            <View style={styles.dateCenter}>
                <Text style={[styles.dateLabel, { color: textColor }]}>
                    {label}
                </Text>
                <Text style={[styles.dateFull, { color: mutedColor }]}>
                    {subLabel}
                </Text>
            </View>

            {/* Next */}
            <TouchableOpacity
                style={[
                    styles.arrowButton,
                    { backgroundColor, borderColor },
                    isToday && styles.arrowDisabled,
                ]}
                onPress={onNext}
                activeOpacity={0.7}
                disabled={isToday}
            >
                <ChevronRight size={22} color={isToday ? mutedColor : textColor} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 16,
    },
    arrowButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowDisabled: {
        opacity: 0.3,
    },
    dateCenter: {
        alignItems: 'center',
        minWidth: 140,
    },
    dateLabel: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    dateFull: {
        fontSize: 13,
        marginTop: 2,
    },
});
