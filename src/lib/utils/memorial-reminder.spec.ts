import { describe, expect, it } from 'vitest';
import { nearestReminderChoice } from './memorial-reminder';

describe('nearestReminderChoice', () => {
	it('returns null when the reminder is off', () => {
		expect(nearestReminderChoice(null)).toBeNull();
	});

	it.each([
		[0, 0],
		[1, 1],
		[2, 3],
		[3, 3],
		[5, 7],
		[7, 7],
		[30, 7]
	])('rounds a lead of %i to %i (tie picks the earlier reminder)', (input, expected) => {
		expect(nearestReminderChoice({ days_before: input, time: '07:00' })?.lead).toBe(expected);
	});

	it.each([
		['06:00', '06:00'],
		['04:30', '06:00'],
		['09:30', '07:00'],
		['15:30', '12:00'],
		['19:00', '19:00'],
		['22:00', '19:00']
	])('rounds a time of %s to %s (tie picks the earlier time)', (input, expected) => {
		expect(nearestReminderChoice({ days_before: 1, time: input })?.time).toBe(expected);
	});
});
