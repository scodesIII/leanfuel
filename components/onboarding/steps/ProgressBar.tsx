import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        { icon: Utensils, label: 'Diet' },
        { icon: User, label: 'Info' },
        { icon: Calendar, label: 'Target' },
        { icon: Check, label: 'Review' },
    ];

    // Calculate progress percentage (e.g., step 2 of 6 = 50%)
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        // Container with bottom margin (mb-6 = margin-bottom: 24px)
        <View className="mb-6">
            {/* Step indicators row */}
            <View className="flex-row justify-between mb-3 px-2">
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
                            className="items-center"  // Center icon and label vertically
                        >
                            {/* Circular icon container */}
                            <View
                                className={`w-10 h-10 rounded-full items-center justify-center mb-1 ${isDone
                                    ? 'bg-blue-500'  // Completed: solid blue
                                    : isActive
                                        ? 'bg-blue-500 border-4 border-blue-200'  // Active: blue with border ring
                                        : 'bg-gray-200'  // Future: gray (inactive)
                                    }`}
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
                                className={`text-xs ${isActive
                                    ? 'text-blue-500 font-semibold'  // Active: blue & bold
                                    : isDone
                                        ? 'text-gray-900'                // Completed: dark gray
                                        : 'text-gray-400'                // Future: light gray
                                    }`}
                            >
                                {step.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Horizontal progress bar track (gray background) */}
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                {/* Progress bar fill (blue, width based on completion %) */}
                <View
                    className="h-full bg-blue-500"
                    // Dynamic width using inline style (NativeWind doesn't support dynamic percentages)
                    style={{ width: `${progress}%` }}
                />
            </View>
        </View>
    );
};