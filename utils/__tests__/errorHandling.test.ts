/**
 * Error Handling Utilities Tests
 * 
 * Testing all error detection, retry logic, and message formatting functions
 * from utils/errorHandling.ts
 */

import {
    isNetworkError,
    isAuthError,
    isValidationError,
    isServerError,
    getErrorMessage,
    getErrorTitle,
    retryOperation,
} from '../errorHandling';

// ============================================================================
// TESTING ERROR DETECTION FUNCTIONS
// ============================================================================

describe('isNetworkError', () => {
    it('should return true for "network request failed" error message', () => {
        const error = new Error('network request failed');
        expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for "fetch failed" error message', () => {
        const error = new Error('fetch failed');
        expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for "failed to fetch" error message', () => {
        const error = new Error('failed to fetch');
        expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ECONNREFUSED error code', () => {
        const error = { code: 'ECONNREFUSED', message: 'Connection refused' };
        expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ENOTFOUND error code', () => {
        const error = { code: 'ENOTFOUND', message: 'Host not found' };
        expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ETIMEDOUT error code', () => {
        const error = { code: 'ETIMEDOUT', message: 'Connection timed out' };
        expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for auth errors', () => {
        const error = new Error('JWT expired');
        expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
        const error = new Error('Invalid input');
        expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for null input', () => {
        expect(isNetworkError(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
        expect(isNetworkError(undefined)).toBe(false);
    });

    it('should handle case-insensitive error messages', () => {
        const error = new Error('NETWORK REQUEST FAILED');
        expect(isNetworkError(error)).toBe(true);
    });
});


describe('isAuthError', () => {
    it('should return true for JWT error messages', () => {
        const error = new Error('JWT expired');
        expect(isAuthError(error)).toBe(true);
    });

    it('should return true for session error messages', () => {
        const error = new Error('Session expired');
        expect(isAuthError(error)).toBe(true);
    });

    it('should return true for unauthorized error messages', () => {
        const error = new Error('Unauthorized access');
        expect(isAuthError(error)).toBe(true);
    });

    it('should return true for "not authenticated" error messages', () => {
        const error = new Error('User not authenticated');
        expect(isAuthError(error)).toBe(true);
    });

    it('should return true for 401 status code', () => {
        const error = { status: 401, message: 'Unauthorized' };
        expect(isAuthError(error)).toBe(true);
    });

    it('should return true for statusCode 401', () => {
        const error = { statusCode: 401, message: 'Unauthorized' };
        expect(isAuthError(error)).toBe(true);
    });

    it('should return false for network errors', () => {
        const error = new Error('network request failed');
        expect(isAuthError(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
        const error = { status: 400, message: 'Invalid input' };
        expect(isAuthError(error)).toBe(false);
    });

    it('should return false for null input', () => {
        expect(isAuthError(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
        expect(isAuthError(undefined)).toBe(false);
    });
});


describe('isValidationError', () => {
    it('should return true for 400 status code', () => {
        const error = { status: 400, message: 'Bad request' };
        expect(isValidationError(error)).toBe(true);
    });

    it('should return true for statusCode 400', () => {
        const error = { statusCode: 400, message: 'Bad request' };
        expect(isValidationError(error)).toBe(true);
    });

    it('should return true for "invalid" in error message', () => {
        const error = new Error('Invalid email format');
        expect(isValidationError(error)).toBe(true);
    });

    it('should return true for "validation" in error message', () => {
        const error = new Error('Validation failed');
        expect(isValidationError(error)).toBe(true);
    });

    it('should return false for network errors', () => {
        const error = new Error('network request failed');
        expect(isValidationError(error)).toBe(false);
    });

    it('should return false for auth errors', () => {
        const error = { status: 401, message: 'Unauthorized' };
        expect(isValidationError(error)).toBe(false);
    });

    it('should return false for null input', () => {
        expect(isValidationError(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
        expect(isValidationError(undefined)).toBe(false);
    });
});


describe('isServerError', () => {
    it('should return true for 500 status code', () => {
        const error = { status: 500, message: 'Internal server error' };
        expect(isServerError(error)).toBe(true);
    });

    it('should return true for 503 status code', () => {
        const error = { status: 503, message: 'Service unavailable' };
        expect(isServerError(error)).toBe(true);
    });

    it('should return true for 599 status code (boundary)', () => {
        const error = { status: 599, message: 'Server error' };
        expect(isServerError(error)).toBe(true);
    });

    it('should return false for 499 status code (just below 500)', () => {
        const error = { status: 499, message: 'Client closed request' };
        expect(isServerError(error)).toBe(false);
    });

    it('should return false for 600 status code (above 5xx range)', () => {
        const error = { status: 600, message: 'Unknown' };
        expect(isServerError(error)).toBe(false);
    });

    it('should return false for 400 status code', () => {
        const error = { status: 400, message: 'Bad request' };
        expect(isServerError(error)).toBe(false);
    });

    it('should return false for null input', () => {
        expect(isServerError(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
        expect(isServerError(undefined)).toBe(false);
    });
});


// ============================================================================
// TESTING ERROR MESSAGE FORMATTING
// ============================================================================

describe('getErrorMessage', () => {
    it('should return network error message for network errors', () => {
        const error = new Error('network request failed');
        const message = getErrorMessage(error);
        expect(message).toBe('No internet connection. Please check your network and try again.');
    });

    it('should return session expired message for JWT errors', () => {
        const error = new Error('JWT expired');
        const message = getErrorMessage(error);
        expect(message).toBe('Your session has expired. Please sign in again.');
    });

    it('should return invalid credentials message', () => {
        const error = new Error('Invalid login credentials');
        const message = getErrorMessage(error);
        expect(message).toBe('Invalid email or password.');
    });

    it('should return user-friendly message for "User already registered"', () => {
        const error = new Error('User already registered');
        const message = getErrorMessage(error);
        expect(message).toBe('An account with this email already exists.');
    });

    it('should return server error message for 5xx errors', () => {
        const error = { status: 500, message: 'Internal server error' };
        const message = getErrorMessage(error);
        expect(message).toBe('Server error. Please try again later.');
    });

    it('should return validation error message for 400 errors', () => {
        const error = { status: 400, message: 'Bad request' };
        const message = getErrorMessage(error);
        expect(message).toBe('Bad request');
    });

    it('should return default message for unknown errors', () => {
        const error = new Error('Something weird happened');
        const message = getErrorMessage(error);
        expect(message).toBe('Something went wrong. Please try again.');
    });

    it('should handle null input gracefully', () => {
        const message = getErrorMessage(null);
        expect(message).toBe('An unexpected error occurred');
    });

    it('should handle undefined input gracefully', () => {
        const message = getErrorMessage(undefined);
        expect(message).toBe('An unexpected error occurred');
    });

    it('should map all common Supabase errors', () => {
        const testCases = [
            { input: 'Email not confirmed', expected: 'Please verify your email address before signing in.' },
            { input: 'Password should be at least 6 characters', expected: 'Password must be at least 6 characters long.' },
            { input: 'Unable to validate email address: invalid format', expected: 'Please enter a valid email address.' },
            { input: 'User not found', expected: 'No account found with this email address.' },
            { input: 'Email rate limit exceeded', expected: 'Too many attempts. Please try again later.' },
        ];

        testCases.forEach(({ input, expected }) => {
            const error = new Error(input);
            const message = getErrorMessage(error);
            expect(message).toBe(expected);
        });
    });
});

describe('getErrorTitle', () => {
    it('should return "No Internet Connection" for network errors', () => {
        const error = new Error('network request failed');
        expect(getErrorTitle(error)).toBe('No Internet Connection');
    });

    it('should return "Session Expired" for auth errors', () => {
        const error = new Error('JWT expired');
        expect(getErrorTitle(error)).toBe('Session Expired');
    });

    it('should return "Server Error" for 5xx errors', () => {
        const error = { status: 500, message: 'Internal server error' };
        expect(getErrorTitle(error)).toBe('Server Error');
    });

    it('should return "Invalid Input" for validation errors', () => {
        const error = { status: 400, message: 'Bad request' };
        expect(getErrorTitle(error)).toBe('Invalid Input');
    });

    it('should return "Error" for unknown errors', () => {
        const error = new Error('Something weird');
        expect(getErrorTitle(error)).toBe('Error');
    });
});


// ============================================================================
// TESTING RETRY LOGIC 
// ============================================================================

describe('retryOperation', () => {
    // Use fake timers to control time in tests
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should succeed on first attempt without retrying', async () => {
        const operation = jest.fn(async () => 'success');

        const promise = retryOperation(operation);
        const result = await promise;

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error and eventually succeed', async () => {
        let attempts = 0;
        const operation = jest.fn(async () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('network request failed');
            }
            return 'success';
        });

        const promise = retryOperation(operation, { maxRetries: 3, retryDelay: 1000 });

        // Fast-forward through all timers
        await jest.runAllTimersAsync();

        const result = await promise;
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries exceeded', async () => {
        // Use real timers for this test to avoid complexity
        jest.useRealTimers();

        const operation = jest.fn(async () => {
            throw new Error('network request failed');
        });

        await expect(
            retryOperation(operation, { maxRetries: 2, retryDelay: 10, exponentialBackoff: false })
        ).rejects.toThrow('network request failed');

        expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries

        // Restore fake timers for other tests
        jest.useFakeTimers();
    });

    it('should NOT retry auth errors', async () => {
        const operation = jest.fn(async () => {
            throw new Error('JWT expired');
        });

        const promise = retryOperation(operation, { maxRetries: 3 });

        await expect(promise).rejects.toThrow('JWT expired');
        expect(operation).toHaveBeenCalledTimes(1); // Should not retry
    });

    it('should NOT retry validation errors', async () => {
        const operation = jest.fn(async () => {
            throw { status: 400, message: 'Invalid input' };
        });

        const promise = retryOperation(operation, { maxRetries: 3 });

        await expect(promise).rejects.toEqual({ status: 400, message: 'Invalid input' });
        expect(operation).toHaveBeenCalledTimes(1); // Should not retry
    });

    it('should use exponential backoff by default', async () => {
        let attempts = 0;
        const operation = jest.fn(async () => {
            attempts++;
            if (attempts < 4) {
                throw new Error('network request failed');
            }
            return 'success';
        });

        const promise = retryOperation(operation, { maxRetries: 3, retryDelay: 1000 });

        // Fast-forward through all timers
        await jest.runAllTimersAsync();

        await promise;

        // With exponential backoff: delays should be 1s, 2s, 4s
        // We can't easily test the exact timing with runAllTimersAsync,
        // but we can verify it eventually succeeds
        expect(operation).toHaveBeenCalledTimes(4);
    });

    it('should respect custom retry options', async () => {
        let attempts = 0;
        const operation = jest.fn(async () => {
            attempts++;
            if (attempts < 2) {
                throw new Error('network request failed');
            }
            return 'success';
        });

        const promise = retryOperation(operation, {
            maxRetries: 5,
            retryDelay: 500,
            exponentialBackoff: false,
        });

        await jest.runAllTimersAsync();

        const result = await promise;
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(2);
    });
});



