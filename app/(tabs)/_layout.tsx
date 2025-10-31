import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SpecialTabButton } from '@/components/SpecialTabButton';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
        // animation: 'fade'
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard', // refers to tab title
          tabBarLabel: 'Dashboard', // refers to tab label
          // tabBarBadge: 2,
          tabBarIcon: ({ color, size }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="customComponentsScreen"
        options={{
          title: 'custom', // refers to tab title
          tabBarLabel: 'custom', // refers to tab label
          tabBarButton: SpecialTabButton,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Handle custom button press
            console.log('TEST');
          },
        }}
      />
      <Tabs.Screen
        name="foodLogginScreen"
        options={{
          title: 'Food', // refers to tab title
          tabBarLabel: 'Food', // refers to tab label
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
