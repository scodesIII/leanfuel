import { useRef, useEffect, useCallback } from 'react';

export function useDebounce(callback: (arg: string) => void, delay: number) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref in commit phase
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on mount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Stable debounced function
    const debouncedFunction = useCallback((arg: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            callbackRef.current(arg);
        }, delay);
    }, [delay]);

    return debouncedFunction;
}