import { describe, expect, it } from 'vitest';
import {
	MemorialDecodeError,
	parsePlainDate,
	toMemorialDraft,
	toMemorialEntry,
	toMemorialRequest
} from './memorial-map';
import type { MemorialDTO } from '$lib/types/memorial';

const base: MemorialDTO = {
	id: 3,
	full_name: 'Trần Thị Bình',
	relationship: 'MOTHER',
	death_calendar: 'lunar',
	death_date: null,
	death_day: 10,
	death_month: 6,
	death_leap_month: false,
	note: 'Mâm chay',
	photo_url: null,
	reminder: { days_before: 2, time: '09:30' },
	created_at: '2026-11-16T00:00:00Z',
	updated_at: '2026-11-16T00:00:00Z'
};

describe('toMemorialEntry', () => {
	it('maps the relationship and keeps an unknown-year lunar date', () => {
		const entry = toMemorialEntry(base);
		expect(entry.relation).toBe('mother');
		expect(entry.id).toBe(3);
		expect(entry.year).toBeNull();
		expect(entry.day).toBe(10);
		expect(entry.month).toBe(6);
		expect(entry.leap).toBe(false);
		expect(entry.hasPhoto).toBe(false);
	});

	it('exposes only a photo flag, never the signed URL', () => {
		const entry = toMemorialEntry({ ...base, photo_url: 'https://storage.example/signed?x=1' });
		expect(entry.hasPhoto).toBe(true);
		expect(entry).not.toHaveProperty('photoUrl');
		expect(JSON.stringify(entry)).not.toContain('storage.example');
	});

	it('round-trips a known-year lunar death_date to day/month/leap', () => {
		const entry = toMemorialEntry({
			...base,
			death_date: '2025-08-03',
			death_day: null,
			death_month: null,
			death_leap_month: null
		});
		expect(entry.calendar).toBe('lunar');
		expect(entry.day).toBe(10);
		expect(entry.month).toBe(6);
		expect(entry.year).toBe(2025);
		expect(entry.leap).toBe(true);
	});

	it('maps a solar date without treating it as an instant', () => {
		const entry = toMemorialEntry({
			...base,
			death_calendar: 'solar',
			death_date: '2020-02-29',
			death_day: null,
			death_month: null
		});
		expect(entry.day).toBe(29);
		expect(entry.month).toBe(2);
		expect(entry.year).toBe(2020);
	});

	it('rounds an old reminder to the nearest UI choice', () => {
		expect(toMemorialEntry(base).reminder).toEqual({ lead: 3, time: '07:00' });
	});

	it('throws a controlled decode error for an unknown relationship', () => {
		expect(() =>
			toMemorialEntry({ ...base, relationship: 'UNCLE' as unknown as MemorialDTO['relationship'] })
		).toThrow(MemorialDecodeError);
	});

	it('parses a plain date and rejects an impossible one', () => {
		expect(parsePlainDate('2026-11-23')?.getDate()).toBe(23);
		expect(parsePlainDate('2026-02-30')).toBeNull();
	});
});

describe('toMemorialRequest', () => {
	it('sends a lunar known-year date as the exact solar date', () => {
		const body = toMemorialRequest({
			...toMemorialDraft(toMemorialEntry(base)),
			year: 2025,
			leap: true
		});
		expect(body.ok).toBe(true);
		if (body.ok) {
			expect(body.body.death_date).toBe('2025-08-03');
			expect(body.body.death_day).toBeUndefined();
			expect(body.body.death_month).toBeUndefined();
			expect(body.body.death_leap_month).toBeUndefined();
		}
	});

	it('rejects a leap month the year does not have', () => {
		const body = toMemorialRequest({
			...toMemorialDraft(toMemorialEntry(base)),
			year: 2026,
			leap: true
		});
		expect(body).toEqual({ ok: false, error: 'date_not_exist' });
	});

	it('sends the minimal reminder and never timezone/add_to_os_reminder', () => {
		const body = toMemorialRequest(toMemorialDraft(toMemorialEntry(base)));
		expect(body.ok).toBe(true);
		if (!body.ok) return;
		expect(body.body.reminder).toEqual({ days_before: 3, time: '07:00' });
		expect(body.body).not.toHaveProperty('timezone');
		expect(body.body).not.toHaveProperty('add_to_os_reminder');
	});

	it('trims the note to null and sends reminder null when off', () => {
		const body = toMemorialRequest({
			...toMemorialDraft(toMemorialEntry(base)),
			note: '   ',
			reminder: null
		});
		expect(body.ok).toBe(true);
		if (!body.ok) return;
		expect(body.body.note).toBeNull();
		expect(body.body.reminder).toBeNull();
	});

	it('rejects 29 February in a common year', () => {
		const body = toMemorialRequest({
			...toMemorialDraft(toMemorialEntry(base)),
			calendar: 'solar',
			day: 29,
			month: 2,
			year: 2025,
			leap: false
		});
		expect(body).toEqual({ ok: false, error: 'date_invalid' });
	});
});
