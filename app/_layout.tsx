import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import "../global.css"
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
//  WARN  'Splashscreen.setOptions' cannot be used in Expo Go. To customize the splash screen, you can use development builds.
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // You can also return a loading indicator here
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* <GluestackUIProvider> */}
        <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
          {/* <Stack.Screen name="index" options={{ headerTitle: "Home", gestureEnabled: false }} /> */}
          {/* <Stack.Screen name="(auth)" options={{ gestureEnabled: false, animation: 'slide_from_right' }} /> */}
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        </Stack>
        <StatusBar style="auto" />
        {/* </GluestackUIProvider> */}
      </ThemeProvider>
    </View>
  );
}

export function ErrorBoundary(props: { error: Error }) {
  return (
    <Text className="text-red-500 p-4">
      An error occurred: {props.error.message}
    </Text>
  );
}