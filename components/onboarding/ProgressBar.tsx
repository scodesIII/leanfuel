import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Target, Activity, Utensils, User, Calendar, Check } from 'lucide-react-native';

// Props interface: defines what data this component receives from parent
interface ProgressBarProps {
    currentStep: number;
    onStepPress: (step: number) => void;
}


export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, onStepPress }) => {
    const steps = [
        { icon: Target, label: 'Goal' },
        { icon: Activity, label: 'Activity' },
        // { icon: Utensils, label: 'Diet' }, // Disabled - calorie tracking focus for now
        { icon: User, label: 'Info' },
        { icon: Calendar, label: 'Target' },
        { icon: Check, label: 'Review' },
    ];

    // Calculate progress percentage (e.g., step 2 of 6 = 50%)
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        // Container with bottom margin (mb-6 = margin-bottom: 24px)
        <View style={styles.container}>
            {/* Step indicators row */}
            <View style={styles.stepsContainer}>
                {/* Loop through each step and render an icon */}
                {steps.map((step, index) => {
                    const Icon = step.icon;  // Get the icon component for this step

                    // Determine step state
                    const isActive = index === currentStep;  // Is this the current step?
                    const isDone = index < currentStep;      // Has this step been completed?

                    return (
                        <TouchableOpacity
                            key={index}
                            // Allow navigation back to completed steps only
                            onPress={() => index < currentStep && onStepPress(index)}
                            // Disable future steps (can't skip ahead)
                            disabled={index > currentStep}
                            style={styles.stepItem}
                        >
                            {/* Circular icon container */}
                            <View
                                style={[
                                    styles.iconContainer,
                                    isDone ? styles.iconContainerDone :
                                        isActive ? styles.iconContainerActive :
                                            styles.iconContainerFuture
                                ]}
                            >
                                {/* Show checkmark for completed steps, icon for others */}
                                {isDone ? (
                                    <Check size={18} color="white" />
                                ) : (
                                    <Icon size={18} color={isActive ? 'white' : '#9CA3AF'} />
                                )}
                            </View>

                            {/* Step label text */}
                            <Text
                                style={[
                                    styles.label,
                                    isActive ? styles.labelActive :
                                        isDone ? styles.labelDone :
                                            styles.labelFuture
                                ]}
                            >
                                {step.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Horizontal progress bar track (gray background) */}
            <View style={styles.progressTrack}>
                {/* Progress bar fill (blue, width based on completion %) */}
                <View
                    style={[
                        styles.progressFill,
                        { width: `${progress}%` }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    stepItem: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    iconContainerDone: {
        backgroundColor: '#3B82F6',
    },
    iconContainerActive: {
        backgroundColor: '#3B82F6',
        borderWidth: 4,
        borderColor: '#BFDBFE',
    },
    iconContainerFuture: {
        backgroundColor: '#E5E7EB',
    },
    label: {
        fontSize: 12,
    },
    labelActive: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    labelDone: {
        color: '#3B82F6', // Same blue as active for consistency
        fontWeight: '600',
    },
    labelFuture: {
        color: '#9CA3AF',
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
    },
});