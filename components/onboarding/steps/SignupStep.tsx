import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/superbase';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useUserStore } from '@/stores/userStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';


export const SignupStep = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // #4 - onboarding data to flush + reset after a successful save
    const { data, reset } = useOnboardingStore();
    const { fetchProfile } = useUserStore();

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


    const handleCreateAccount = async () => {
        // Clear previous errors
        setError('');

        // Normalize email only (lowercase + trim)
        const normalizedEmail = email.trim().toLowerCase();

        // NEVER modify passwords
        const passwordRaw = password;
        const confirmPasswordRaw = confirmPassword;

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

        // #2 - try/finally guarantees loading always resets, on every exit path
        try {
            let userId: string | null = null;

            // #3 (retry path) - if signup already happened but the flush failed
            // last time, the route guard sends the authenticated user back here.
            // Skip signUp and go straight to the flush.
            const existingUser = useUserStore.getState().user;

            if (existingUser) {
                userId = existingUser.id;
            } else {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: normalizedEmail,
                    password: passwordRaw,
                });

                if (signUpError) {
                    switch (signUpError.message) {
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

                // Take the id straight from the signUp response — the user store
                // is populated asynchronously by onAuthStateChange and may lag here.
                userId = signUpData.user?.id ?? null;
            }

            // #3 (null guard) - never call the flush without a real id
            if (!userId) {
                setError('Unable to create account. Please try again.');
                return;
            }

            // #1 - flush the collected onboarding data. complete_onboarding
            // atomically saves the profile and computes the nutrition goals.
            const { error: completeError } = await supabase.rpc('complete_onboarding', {
                p_user_id: userId,
                p_goal: data.goal,
                p_activity_level: data.activityLevel,
                p_dietary_preferences: data.dietaryPreferences,
                p_age: parseInt(data.age, 10),
                p_gender: data.gender,
                p_current_weight: parseFloat(data.weight),
                p_target_weight: parseFloat(data.targetWeight),
                p_height: parseFloat(data.height),
                p_timeframe: data.timeframe,
            });

            if (completeError) {
                console.error('Error completing onboarding:', completeError);
                // Data is still persisted in the onboarding store, so the user can
                // retry — the retry path above will skip signUp and re-flush.
                setError('Could not save your plan. Please try again.');
                return;
            }

            // Sync the freshly saved profile, clear the local onboarding data,
            // then leave the wizard.
            await fetchProfile();
            reset();
            router.replace('/(tabs)/dashboard');
        } catch (err) {
            console.error('Unexpected error creating account:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Create your account to save your plan
                    </ThemedText>
                </View>

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
                        onPress={handleCreateAccount}
                        style={{ marginTop: 24 }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
        paddingVertical: 32,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        opacity: 0.7,
        textAlign: 'center',
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
});
