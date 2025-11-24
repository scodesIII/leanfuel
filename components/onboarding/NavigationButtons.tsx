import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
}) => {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      {/* Only show back button if not on first step */}
      {currentStep > 0 && (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={[styles.button, styles.backButton, { borderColor: borderColor }]}
        >
          <ChevronLeft size={20} color={textColor} style={{ opacity: 1 }} />
          <Text style={[styles.buttonText, styles.backButtonText, { color: textColor, opacity: 1 }]}>
            Back
          </Text>
        </TouchableOpacity>
      )}

      {currentStep < totalSteps - 1 && (
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.7}
          style={[styles.button, styles.nextButton, { backgroundColor: primaryColor }]}
        >
          <Text style={[styles.buttonText, styles.nextButtonText]}>Continue</Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 16,
    opacity: 1,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  backButtonText: {
    marginLeft: 8,
    opacity: 1,
  },
  nextButton: {
    flex: 1,
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    marginRight: 8,
  },
});
