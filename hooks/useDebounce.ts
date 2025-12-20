import { useRef, useEffect, useCallback } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): (...args: Parameters<T>) => void {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref in commit phase
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // Stable debounced function
    const debouncedFunction = useCallback((...args: Parameters<T>) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);

    return debouncedFunction;
}