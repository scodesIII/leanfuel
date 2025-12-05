import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
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
          tabBarIcon: ({ color, size }) => <Ionicons size={28} name="home" color={color} />,
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
          tabBarIcon: ({ color }) => <Ionicons size={28} name="fast-food" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'You', // refers to tab title
          tabBarLabel: 'You', // refers to tab label
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
