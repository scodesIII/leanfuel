import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

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
  return (
    <View style={styles.container}>
      {/* Only show back button if not on first step */}
      {currentStep > 0 && (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.button, styles.backButton]}
        >
          <ChevronLeft size={20} color='#374151' />
          <Text style={[styles.buttonText, styles.backButtonText]}>
            Back
          </Text>
        </TouchableOpacity>
      )}

      {currentStep < totalSteps - 1 && (
        <TouchableOpacity
          onPress={onNext}
          style={[styles.button, styles.nextButton]}
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
  },
  backButton: {
    backgroundColor: '#E5E7EB',
  },
  backButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    color: '#374151',
    marginLeft: 8,
  },
  backButtonTextDisabled: {
    color: '#9CA3AF',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    marginRight: 8,
  },
});
