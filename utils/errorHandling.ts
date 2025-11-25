/**
 * Error Handling Utilities
 * 
 * Provides comprehensive error handling for the LeanFuel app including:
 * - Error type detection (network, auth, validation, server)
 * - Retry logic with exponential backoff
 * - User-friendly error message conversion
 */

import { PostgrestError } from '@supabase/supabase-js';

// ============================================================================
// ERROR DETECTION
// ============================================================================

/**
 * Detects if an error is due to network connectivity issues
 * 
 * Common network error indicators:
 * - "network request failed"
 * - "fetch failed"
 * - Connection refused errors
 * 
 * @param error - The error to check
 * @returns true if error is network-related
 */
export function isNetworkError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('failed to fetch') ||
        errorCode === 'econnrefused' ||
        errorCode === 'enotfound' ||
        errorCode === 'etimedout'
    );
}

/**
 * Detects if an error is due to authentication/session issues
 * 
 * Common auth error indicators:
 * - JWT expired or invalid
 * - Session expired
 * - 401 Unauthorized status
 * 
 * @param error - The error to check
 * @returns true if error is auth-related
 */
export function isAuthError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const status = error.status || error.statusCode;

    return (
        errorMessage.includes('jwt') ||
        errorMessage.includes('session') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('not authenticated') ||
        status === 401
    );
}

/**
 * Detects if an error is due to validation issues
 * 
 * Common validation error indicators:
 * - 400 Bad Request status
 * - "invalid" in error message
 * 
 * @param error - The error to check
 * @returns true if error is validation-related
 */
export function isValidationError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const status = error.status || error.statusCode;

    return (
        status === 400 ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('validation')
    );
}

/**
 * Detects if an error is a server error (5xx)
 * 
 * @param error - The error to check
 * @returns true if error is server-related
 */
export function isServerError(error: any): boolean {
    if (!error) return false;

    const status = error.status || error.statusCode;
    return status >= 500 && status < 600;
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Options for retry operation
 */
export interface RetryOptions {
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** Initial delay in milliseconds (default: 1000) */
    retryDelay?: number;
    /** Whether to use exponential backoff (default: true) */
    exponentialBackoff?: boolean;
}

/**
 * Retries an async operation with exponential backoff
 * 
 * Only retries network errors - auth and validation errors are thrown immediately
 * 
 * Retry schedule with default settings:
 * - Attempt 1: Immediate
 * - Attempt 2: Wait 1 second
 * - Attempt 3: Wait 2 seconds
 * - Attempt 4: Wait 4 seconds
 * 
 * @param operation - The async function to retry
 * @param options - Retry configuration
 * @returns The result of the operation
 * @throws The last error if all retries fail
 * 
 * @example
 * const data = await retryOperation(
 *   () => supabase.from('profiles').select(),
 *   { maxRetries: 3, retryDelay: 1000 }
 * );
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        exponentialBackoff = true,
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Try to execute the operation
            return await operation();
        } catch (error) {
            lastError = error;

            // Don't retry auth or validation errors - these won't succeed on retry
            if (isAuthError(error) || isValidationError(error)) {
                throw error;
            }

            // Don't retry if this was the last attempt
            if (attempt === maxRetries) {
                throw error;
            }

            // Only retry network errors
            if (!isNetworkError(error)) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = exponentialBackoff
                ? retryDelay * Math.pow(2, attempt)
                : retryDelay;

            console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError;
}

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

/**
 * Converts technical error messages to user-friendly text
 * 
 * Maps common Supabase and network errors to readable messages
 * 
 * @param error - The error to convert
 * @returns User-friendly error message
 * 
 * @example
 * const message = getErrorMessage(error);
 * Alert.alert('Error', message);
 */
export function getErrorMessage(error: any): string {
    if (!error) return 'An unexpected error occurred';

    const errorMessage = error.message || '';

    // Network errors
    if (isNetworkError(error)) {
        return 'No internet connection. Please check your network and try again.';
    }

    // Auth errors
    if (isAuthError(error)) {
        if (errorMessage.includes('JWT')) {
            return 'Your session has expired. Please sign in again.';
        }
        if (errorMessage.includes('Invalid login credentials')) {
            return 'Invalid email or password. Please try again.';
        }
        return 'Authentication failed. Please sign in again.';
    }

    // Supabase-specific errors
    const errorMap: Record<string, string> = {
        'User already registered': 'An account with this email already exists.',
        'Invalid login credentials': 'Invalid email or password.',
        'Email not confirmed': 'Please verify your email address before signing in.',
        'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
        'Unable to validate email address: invalid format': 'Please enter a valid email address.',
        'User not found': 'No account found with this email address.',
        'Email rate limit exceeded': 'Too many attempts. Please try again later.',
        'Signup requires a valid password': 'Please enter a password.',
        'Database error saving new user': 'Unable to create account. Please try again.',
    };

    // Check for exact matches
    for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    // Server errors
    if (isServerError(error)) {
        return 'Server error. Please try again later.';
    }

    // Validation errors
    if (isValidationError(error)) {
        return errorMessage || 'Invalid input. Please check your information.';
    }

    // Default fallback
    return 'Something went wrong. Please try again.';
}

/**
 * Gets a user-friendly error title based on error type
 * 
 * @param error - The error to categorize
 * @returns Appropriate error title for Alert
 */
export function getErrorTitle(error: any): string {
    if (isNetworkError(error)) return 'No Internet Connection';
    if (isAuthError(error)) return 'Session Expired';
    if (isServerError(error)) return 'Server Error';
    if (isValidationError(error)) return 'Invalid Input';
    return 'Error';
}
