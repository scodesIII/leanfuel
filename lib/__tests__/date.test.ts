/**
 * Date Utilities Tests
 *
 * Pins the timezone to Europe/London so the BST cases fail the same way on
 * every machine. Must be set before any Date is created.
 */
process.env.TZ = 'Europe/London';

import { dateToLocalString, parseLocalDate } from '../date';

describe('dateToLocalString', () => {
    it('runs in BST (sanity check that TZ took effect)', () => {
        expect(new Date('2026-06-15T12:00:00Z').getTimezoneOffset()).toBe(-60);
    });

    it('returns the local date just after midnight in BST', () => {
        // 00:30 BST on 16 June is still 15 June in UTC
        const justAfterMidnight = new Date('2026-06-15T23:30:00Z');

        expect(justAfterMidnight.toISOString().split('T')[0]).toBe('2026-06-15'); // the old bug
        expect(dateToLocalString(justAfterMidnight)).toBe('2026-06-16');
    });

    it('matches UTC in GMT (winter)', () => {
        expect(dateToLocalString(new Date('2026-01-15T00:30:00Z'))).toBe('2026-01-15');
    });

    it('zero-pads month and day', () => {
        expect(dateToLocalString(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('round-trips with parseLocalDate across the clocks-forward day', () => {
        expect(dateToLocalString(parseLocalDate('2026-03-29'))).toBe('2026-03-29');
    });
});
