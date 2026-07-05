import { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Input } from '@/components/common/Input';
import { useUserStore } from '@/stores/userStore';
import { useWeightStore } from '@/stores/weightStore';
import { kgToDisplay, displayToKg, unitLabel, roundTo1Decimal } from '@/utils/units';


interface LogWeightModalProps {
    visible: boolean;
    onClose: () => void;
}



export const LogWeightModal = ({ visible, onClose }: LogWeightModalProps) => {
    const { profile } = useUserStore();
    const { addWeightLog, isLoading, saveError } = useWeightStore();

    const [weightText, setWeightText] = useState('');
    const [notes, setNotes] = useState('');
    const [touched, setTouched] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const units = profile?.preferred_units || 'metric';


    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');

    // prefill on open
    useEffect(() => {
        if (visible) {
            const prefilledText = profile?.current_weight ? kgToDisplay(profile.current_weight, units).toString() : '';
            setWeightText(prefilledText);
            setNotes('');
            setTouched(false);
            setValidationError(null);
        }
    }, [visible, profile]);

    function validateWeightInput(input: string): string | null {
        if (!input) {
            return 'Weight is required';
        }
        if (isNaN(parseFloat(input))) {
            return 'Please enter a valid number';
        }
        if (parseFloat(input) <= 0) {
            return 'Weight must be greater than zero';
        }
        // postgres upper bound for numeric(5,1) is 999.9
        // sane range between 20kg and 500kg (44lbs to 1100lbs)
        const weightKg = displayToKg(parseFloat(input), units);
        if (weightKg < 20 || weightKg > 500) {
            return 'Weight must be between 20kg and 500kg';
        }

        return null;
    }

    const handleSave = async () => {
        setTouched(true);
        const error = validateWeightInput(weightText);
        if (error) {
            setValidationError(error);
            return;
        }

        const weightKg = displayToKg(parseFloat(weightText), units);

        try {
            await addWeightLog(weightKg, undefined, notes || undefined);
            onClose();
        } catch (error) {
            console.error('Failed to log weight:', error);
        }
    };


    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            {/* header (X + title), Input for weight, Input for notes, footer Save button */}
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: backgroundColor }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>Log Weight</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={textColor } />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Input
                        label={`Weight (${unitLabel(units)})`}
                        value={weightText}
                        placeholder="Enter weight"
                        touched={touched}
                        onChangeText={(text) => {
                            setWeightText(text);
                            if (touched) {
                                setValidationError(validateWeightInput(text));
                            }
                        }}
                        keyboardType="decimal-pad"
                        error={validationError || saveError || undefined}
                    />
                    <Input
                        label="Notes (optional)"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </View>

                <TouchableOpacity style={[styles.saveButton, { backgroundColor: primaryColor }]} onPress={handleSave} disabled={isLoading}>
                    <Text style={[styles.saveButtonText, { color: textColor }]}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    saveButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});     
    
    