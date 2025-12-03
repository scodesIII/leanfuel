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

