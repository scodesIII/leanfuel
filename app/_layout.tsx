import { Stack, useSegments, useRouter, usePathname } from 'expo-router';
import * as Font from 'expo-font';
import { useCallback, useEffect, useState } from 'react';
import { Text, View, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import "../global.css"
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { useUserStore } from '@/stores/userStore';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

// Ignore SafeAreaView deprecation warning from Expo Router/React Navigation dependencies
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

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

  // Get auth state from user store
  const { user, profile, initialize, isInitialized, isLoading } = useUserStore();

  // Get current route information for navigation guards
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state on app load
  useEffect(() => {
    initialize();
  }, []);

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

  // ROUTE GUARD: Protect routes based on authentication and onboarding status
  useEffect(() => {
    // Wait for both app and auth to be ready before applying route guards
    if (!appIsReady || !isInitialized) return;

    // Define route categories for easier management
    const inAuthGroup = segments[0] === '(auth)'; // signin, signup pages
    const inTabsGroup = segments[0] === '(tabs)'; // dashboard and main app
    const isOnboarding = pathname === '/onboarding';
    const isHome = pathname === '/';

    // GUARD 1: Redirect unauthenticated users trying to access protected routes
    // Protected routes include: dashboard (tabs), onboarding
    if (!user) {
      // Allow access to public routes (home, signin, signup)
      if (isHome || inAuthGroup) {
        return; // User is on a public route, allow access
      }

      // User is not logged in and trying to access protected route
      // Redirect to home page
      // console.log('🔒 Route Guard: Unauthenticated user redirected to home');
      router.replace('/');
      return;
    }

    // GUARD 2: Redirect authenticated users who haven't completed onboarding
    // They should only be able to access the onboarding page
    if (user && !profile?.onboarding_completed) {
      // If they're already on onboarding page, allow access
      if (isOnboarding) {
        return;
      }

      // If they're on auth pages (signin/signup), allow them to sign out
      if (inAuthGroup) {
        return;
      }

      // User hasn't completed onboarding and is trying to access other routes
      // Redirect to onboarding
      // console.log('📋 Route Guard: User redirected to complete onboarding');
      router.replace('/onboarding');
      return;
    }

    // GUARD 3: Redirect authenticated users with completed onboarding away from onboarding
    // Once onboarding is complete, they shouldn't access it again
    if (user && profile?.onboarding_completed && isOnboarding) {
      // User has completed onboarding but is trying to access onboarding page
      // Redirect to dashboard
      // console.log('✅ Route Guard: Onboarding complete, redirected to dashboard');
      router.replace('/(tabs)/dashboard');
      return;
    }

    // GUARD 4: Redirect authenticated users away from home page
    // If user is logged in with completed onboarding, redirect to dashboard
    if (user && profile?.onboarding_completed && isHome) {
      // console.log('✅ Route Guard: Already authenticated, redirected to dashboard');
      router.replace('/(tabs)/dashboard');
      return;
    }

    // GUARD 5: Redirect authenticated users away from auth pages
    // If user is logged in, they shouldn't see signin/signup
    if (user && profile?.onboarding_completed && inAuthGroup) {
      // console.log('✅ Route Guard: Already authenticated, redirected to dashboard');
      router.replace('/(tabs)/dashboard');
      return;
    }

    // All guards passed - allow navigation
  }, [user, profile, segments, pathname, appIsReady, isInitialized]);

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

  // Show loading screen while app is initializing
  if (!appIsReady || !isInitialized) {
    return null; // You can also return a loading indicator here
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* <GluestackUIProvider> */}
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" options={{ headerTitle: "Home", gestureEnabled: false }} />
          <Stack.Screen name="(auth)" options={{ gestureEnabled: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        </Stack>
        <StatusBar style="auto" />
        {/* </GluestackUIProvider> */}
      </ThemeProvider>
      <Toast />
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