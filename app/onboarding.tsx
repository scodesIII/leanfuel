import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function OnboardingPage() {
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
            <StatusBar style="auto" />
            <OnboardingFlow />
        </SafeAreaView>
    );
}
