import { describe, expect, it } from 'vitest';
import { todayInVietnam, toPlainDate, validateMemorialForm } from './memorial-validate';
import type { MemorialFormInput } from './memorial-validate';

const base: MemorialFormInput = {
	name: 'Nguyễn Văn An',
	relation: 'father',
	calendar: 'lunar',
	day: 15,
	month: 10,
	year: 2020,
	leap: false,
	note: '',
	reminderOn: true,
	lead: 1,
	time: '07:00'
};

const now = new Date('2026-11-16T12:00:00+07:00');

describe('validateMemorialForm', () => {
	it('accepts a valid lunar date and trims the name', () => {
		const result = validateMemorialForm({ ...base, name: '  Nguyễn Văn An  ' }, now);
		expect(result.valid).toBe(true);
		expect(result.draft.name).toBe('Nguyễn Văn An');
	});

	it('rejects an empty and an over-long name', () => {
		expect(validateMemorialForm({ ...base, name: '   ' }, now).errors.name).toBe('empty');
		expect(validateMemorialForm({ ...base, name: 'a'.repeat(101) }, now).errors.name).toBe('long');
	});

	it('rejects an over-long note', () => {
		expect(validateMemorialForm({ ...base, note: 'a'.repeat(1001) }, now).errors.note).toBe(
			'note_long'
		);
	});

	it('rejects a future date', () => {
		expect(
			validateMemorialForm({ ...base, calendar: 'solar', day: 17, month: 11, year: 2026 }, now)
				.errors.date
		).toBe('future');
	});

	it('rejects a year before 1900', () => {
		expect(validateMemorialForm({ ...base, year: 1899 }, now).errors.date).toBe('year_min');
	});

	it('rejects a leap month the year does not have', () => {
		expect(
			validateMemorialForm({ ...base, year: 2026, month: 6, leap: true }, now).errors.date
		).toBe('not_exist');
	});

	it('rejects day 30 in a short lunar month', () => {
		expect(validateMemorialForm({ ...base, year: 2026, month: 7, day: 30 }, now).errors.date).toBe(
			'invalid'
		);
	});

	it('accepts 29 February without a year (contract §2.3)', () => {
		const result = validateMemorialForm(
			{ ...base, calendar: 'solar', day: 29, month: 2, year: null },
			now
		);
		expect(result.valid).toBe(true);
	});

	it('rejects a reminder outside the UI choices', () => {
		expect(validateMemorialForm({ ...base, lead: 2 }, now).errors.reminder).toBe('invalid');
		expect(validateMemorialForm({ ...base, time: '08:00' }, now).errors.reminder).toBe('invalid');
	});
});

describe('todayInVietnam', () => {
	it('uses the Vietnam day even when the server clock is still on the previous UTC day', () => {
		expect(todayInVietnam(new Date('2026-11-16T18:00:00Z'))).toEqual({
			year: 2026,
			month: 11,
			day: 17
		});
	});

	it('formats a local date as YYYY-MM-DD without a UTC shift', () => {
		expect(toPlainDate(new Date(2026, 10, 23))).toBe('2026-11-23');
	});
});
