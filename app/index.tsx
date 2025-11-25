import { StyleSheet } from 'react-native';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'


import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/common/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import FeatureItem from '@/components/FeatureItem';

// import { Button, ButtonText } from "@/components/ui/button"
// import { Text } from "@/components/ui/text"


export default function Home() {
  const { width, height } = useWindowDimensions();
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar style="auto" />

      <View style={styles.container}>
        {/* Decorative elements */}
        <View style={styles.decorationContainer}>
          <View
            style={[
              styles.circleDecoration,
              {
                backgroundColor: primaryColor,
                width: width * 0.6,
                height: width * 0.6,
                top: -width * 0.3,
                right: -width * 0.2,
                opacity: 0.2,
              }
            ]}
          />
          <View
            style={[
              styles.circleDecoration,
              {
                backgroundColor: secondaryColor,
                width: width * 0.4,
                height: width * 0.4,
                top: height * 0.15,
                left: -width * 0.2,
                opacity: 0.15,
              }
            ]}
          />
          <View
            style={[
              styles.circleDecoration,
              {
                backgroundColor: accentColor,
                width: width * 0.3,
                height: width * 0.3,
                bottom: height * 0.1,
                right: -width * 0.1,
                opacity: 0.1,
              }
            ]}
          />
        </View>

        {/* Logo and app name */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { backgroundColor: primaryColor }]}>
            <Ionicons
              name="leaf"
              size={64}
              color="white"
              style={styles.logoIcon}
              accessibilityLabel="logo"
            />
          </View>
          <ThemedText type="title" style={styles.appName}>
            LeanFuel
          </ThemedText>
          <ThemedText style={styles.tagline}>
            Your journey to better health starts here
          </ThemedText>
        </View>

        {/* Feature highlights */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="nutrition-outline"
            title="Track your nutrition"
            description="Log meals, scan barcodes, and monitor daily intake"
          />
          <FeatureItem
            icon="barbell-outline"
            title="Log your workouts"
            description="Record exercises and track your progress"
          />
          <FeatureItem
            icon="analytics-outline"
            title="Visualize progress"
            description="See your journey with detailed insights"
          />
        </View>

        {/* Call to action buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/(auth)/signup" asChild>
            <Button
              title="Get Started"
              variant="primary"
              style={styles.button}
            />
          </Link>

          <View style={styles.loginLinkContainer}>
            <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity>
                <ThemedText style={{ color: primaryColor, fontWeight: '600' }}>
                  Log in
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circleDecoration: {
    position: 'absolute',
    borderRadius: 1000,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  appName: {
    marginTop: 20,
    fontSize: 36,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    marginBottom: 12,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    opacity: 0.8,
  },
});