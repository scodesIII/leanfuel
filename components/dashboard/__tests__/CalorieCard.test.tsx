import React from 'react';
import { render } from '@testing-library/react-native';
import { CalorieCard } from '../CalorieCard';

// Mock the ProgressRing component
jest.mock('../ProgressRing', () => ({
    ProgressRing: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
    useThemeColor: jest.fn(() => '#000000'),
}));

describe('CalorieCard', () => {
    // =========================================================================
    // PROGRESS CALCULATION TESTS
    // =========================================================================
    describe('Progress Calculation', () => {
        it('should calculate 0% progress when consumed is 0', () => {
            const { getByText } = render(<CalorieCard consumed={0} goal={2000} />);

            // Should show 0 consumed
            expect(getByText('0')).toBeTruthy();
            // Should show NOT STARTED status
            expect(getByText('NOT STARTED')).toBeTruthy();
        });

        it('should calculate 50% progress correctly', () => {
            const { getAllByText, getByText } = render(<CalorieCard consumed={1000} goal={2000} />);

            // Should show consumed amount (appears in center of ring)
            const consumedElements = getAllByText('1,000');
            expect(consumedElements.length).toBeGreaterThan(0);
            // Should show goal
            expect(getByText('2,000')).toBeTruthy();
            // Should show ON TRACK status
            expect(getByText('ON TRACK')).toBeTruthy();
        });

        it('should calculate 100% progress correctly', () => {
            const { getByText } = render(<CalorieCard consumed={2000} goal={2000} />);

            // Should show GOAL MET status
            expect(getByText('GOAL MET')).toBeTruthy();
            // Should show 0 remaining
            expect(getByText('0')).toBeTruthy();
            expect(getByText('remaining')).toBeTruthy();
        });

        it('should cap progress at 100% for display (not show over 100%)', () => {
            const { getByText, queryByText } = render(<CalorieCard consumed={2500} goal={2000} />);

            // Progress should be capped at 100% in the badge
            expect(getByText('100%')).toBeTruthy();
            // Should NOT show OVER status (it's shown as GOAL MET when exactly 100%)
            // The component shows GOAL MET at 100%, OVER only when isOverGoal is true
            // Let me check the actual status shown
            expect(getByText('500')).toBeTruthy();
            expect(getByText('over goal')).toBeTruthy();
        });

        it('should handle goal of 0 without crashing', () => {
            const { getAllByText, getByText } = render(<CalorieCard consumed={1000} goal={0} />);

            // Should show consumed amount (may appear multiple times)
            const consumedElements = getAllByText('1,000');
            expect(consumedElements.length).toBeGreaterThan(0);
            // Should show goal of 0
            expect(getByText('0')).toBeTruthy();
        });

        it('should calculate remaining calories correctly', () => {
            const { getByText } = render(<CalorieCard consumed={1500} goal={2000} />);

            // Should show 500 remaining
            expect(getByText('500')).toBeTruthy();
            expect(getByText('remaining')).toBeTruthy();
        });
    });
});
