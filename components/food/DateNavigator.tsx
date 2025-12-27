import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface DateNavigatorProps {
    selectedDate: Date;
    onPrevious: () => void;
    onNext: () => void;
}

export const DateNavigator = ({ selectedDate, onPrevious, onNext }: DateNavigatorProps) => { 
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');


    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = isSameDay(selectedDate, today);
    const isYesterday = isSameDay(selectedDate, yesterday);

    // Get display label
    const getDateLabel = () => {
        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';
        return selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    };

    // Get full date string
    const getFullDate = () => {
        return selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };


    return (
            <View style={styles.container}>
                {/* Previous Day Button */}
                <TouchableOpacity
                    style={[styles.arrowButton, { backgroundColor, borderColor }]}
                    onPress={onPrevious}
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={22} color={textColor} />
                </TouchableOpacity>
    
                {/* Date Display */}
                <View style={styles.dateCenter}>
                    <Text style={[styles.dateLabel, { color: textColor }]}>
                        {getDateLabel()}
                    </Text>
                    <Text style={[styles.dateFull, { color: mutedColor }]}>
                        {getFullDate()}
                    </Text>
                </View>
    
                {/* Next Day Button */}
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
}




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