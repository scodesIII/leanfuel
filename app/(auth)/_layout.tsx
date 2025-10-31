import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="signin" options={{ gestureEnabled: false }} />
      <Stack.Screen name="signup" options={{ gestureEnabled: false }} />
    </Stack>
  );
}