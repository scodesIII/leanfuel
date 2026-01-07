import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router, Link } from 'expo-router';
import { supabase } from '@/lib/superbase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Client-side password validation for UX (Supabase will enforce server-side)
  const validatePassword = (password: string) => {
    return {
      isValid: password.length >= 6,
      errors: [
        ...(password.length < 6 ? ['Password must be at least 6 characters'] : []),
        ...(!(/[a-z]/.test(password)) ? ['Include lowercase letters'] : []),
        ...(!(/[A-Z]/.test(password)) ? ['Include uppercase letters'] : []),
        ...(!(/[0-9]/.test(password)) ? ['Include numbers'] : []),
      ]
    };
  };


  const handleSignUp = async () => {
    // Clear previous errors
    setError('');

    // Normalize email only (lowercase + trim)
    const normalizedEmail = email.trim().toLowerCase();

    // NEVER modify passwords
    const passwordRaw = password;
    const confirmPasswordRaw = confirmPassword

    if (!validateEmail(normalizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    const passwordCheck = validatePassword(passwordRaw);
    if (!passwordCheck.isValid) {
      setError(passwordCheck.errors[0]);
      return;
    }

    // Password confirmation (compare raw values)
    if (passwordRaw !== confirmPasswordRaw) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    // setError('');   // Reset error state before making the request

    // Optional: Add rate limiting logic here if needed


    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: passwordRaw,
        options: {
          // Optional: Add metadata
          data: {
            signup_method: 'email',
          }
        }
      });

      if (error) {
        console.error('Signup error:', error.message);

        // Handle specific Supabase errors gracefully
        switch (error.message) {
          case 'User already registered':
            setError('An account with this email already exists');
            break;
          case 'Password should be at least 6 characters':
            setError('Password must be at least 6 characters');
            break;
          case 'Unable to validate email address: invalid format':
            setError('Please enter a valid email address');
            break;
          default:
            setError('Unable to create account. Please try again.');
        }
        return;
      }

      if (data?.user) {
        // Success - clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redirect to onboarding to complete profile setup
        router.replace('/onboarding');
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Something went wrong. Please try again.');
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
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign up to start tracking your health journey
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
                placeholder="At least 6 characters"
                isPassword
                value={password}
                onChangeText={setPassword}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                }
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                isPassword
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                }
              />

              <Button
                title="Create Account"
                loading={loading}
                disabled={loading}
                onPress={handleSignUp}
                style={{ marginTop: 24 }}
              />

              <View style={styles.loginContainer}>
                <ThemedText>Already have an account? </ThemedText>
                <Link href="/(auth)/signin" asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: primaryColor }}>
                      Log in
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 48,
  },
});