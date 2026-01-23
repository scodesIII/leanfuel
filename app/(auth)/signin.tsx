import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { supabase } from '@/lib/superbase';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Link, router } from 'expo-router';



import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  // Enhanced email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  };

  const validatePasswordForSignIn = (password: string) => {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'Invalid email or password';
    }

    if (password.length > 72) {
      return 'Invalid email or password';
    }

    return null;
  };


  // Optional: Add rate limiting helper
  const useRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = useRef<number[]>([]);

  const isRateLimited = () => {
    const now = Date.now();
    const recentAttempts = attempts.current.filter(
      attempt => now - attempt < windowMs
    );
    attempts.current = recentAttempts;

    if (recentAttempts.length >= maxAttempts) {
      return true;
    }

    attempts.current.push(now);
    return false;
  };

    return { isRateLimited };
  };


  // Usage with rate limiting
  const handleSignInWithRateLimit = async () => {
    const { isRateLimited } = useRateLimit();

    if (isRateLimited()) {
      Alert.alert('Error', 'Too many login attempts. Please try again later.');
      return;
    }

    // Continue with regular sign-in logic...
    await handleSignIn();
  };

  const handleSignIn = async () => {
    // Input validation
    if (!email?.trim() || !password?.trim()) {
      setError('All fields are required');
      return;
    }
    // Email format validation
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    const passwordError = validatePasswordForSignIn(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Normalize email
        password: password,
      });

      if (error) {
        // Log error for debugging (don't expose sensitive details to user)
        console.error('Auth error:', error);

        // Generic error message to prevent user enumeration attacks
        setError('Invalid email or password');
        return;
      }

      // Verify user is authenticated
      if (data?.user) {
        // Optional: Check if email is verified
        if (!data.user.email_confirmed_at) {
          Alert.alert('Error', 'Please verify your email before signing in');
          return;
        }

        // Success - reset navigation stack and navigate to main app
        router.dismissAll();
        router.replace('/(tabs)/dashboard');
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main content */}
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>Welcome back</ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to continue your fitness journey
            </ThemedText>

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: `${errorColor}1A` }]}>
                <ThemedText style={[styles.errorText, { color: errorColor }]}>{error}</ThemedText>
              </View>
            ) : null}

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                leftIcon={
                  <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                }
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                isPassword
                value={password}
                onChangeText={setPassword}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                }
              />

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <ThemedText style={{ color: primaryColor }}>
                    Forgot password?
                  </ThemedText>
                </TouchableOpacity>
              </Link>

              <Button
                title="Sign In"
                loading={loading}
                disabled={loading}
                onPress={handleSignInWithRateLimit}
                style={{ marginTop: 24 }}
              />

              <View style={styles.registerContainer}>
                <ThemedText>Don't have an account? </ThemedText>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: primaryColor }}>
                      Sign up
                    </ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    opacity: 0.7,
  },
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  form: {
    width: '100%',
    maxWidth: 400, // Add a maximum width for larger screens
    alignSelf: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 48,
  },
});

