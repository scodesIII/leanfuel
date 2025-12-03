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