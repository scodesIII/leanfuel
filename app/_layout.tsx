import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { SplashScreen } from 'expo-router';
import "../global.css"

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  useEffect(() => {
    if(loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // You can also return a loading indicator here
  }

  return (
    <GluestackUIProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom'}} >
        <Stack.Screen name="index" options={{ headerTitle: "Home", gestureEnabled: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}

export function ErrorBoundary(props: { error: Error }) {
  return (
    <Text className="text-red-500 p-4">
      An error occurred: {props.error.message}
    </Text>
  );
}