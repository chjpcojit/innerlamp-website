import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isMemorialFull, memorialCountView, nextAnniversary, showMemorialPhoto } from './memorial';
import { toPlainDate } from './memorial-validate';
import type { MemorialCalendar } from '$lib/types/memorial';

// Product vectors of innerlamp-memorial docs/product/memorial/rules, pinned by SOURCE.json.
// Never edited by hand. / Bản pin vector của product spec.
type Case = {
	name: string;
	input: {
		today: string;
		calendar: MemorialCalendar;
		day: number;
		month: number;
		leap_month?: boolean;
		death_year: number | null;
	};
	expected: { next_date: string; days_left: number; ordinal: number | null };
};

const load = (name: string): { cases: Case[] } =>
	JSON.parse(
		readFileSync(new URL(`../../../tests/vectors/memorial/${name}`, import.meta.url), 'utf8')
	);

describe('next-anniversary.json (BR-MEM-05…09)', () => {
	const vector = load('next-anniversary.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		const entry = {
			calendar: input.calendar,
			day: input.day,
			month: input.month,
			year: input.death_year
		};
		const next = nextAnniversary(entry, new Date(`${input.today}T00:00:00`));
		expect(toPlainDate(next.date)).toBe(expected.next_date);
		expect(next.days).toBe(expected.days_left);
		expect(next.nth).toBe(expected.ordinal);
	});
});

describe('showMemorialPhoto (W1)', () => {
	it('never shows a photo while the flag is off', () => {
		expect(showMemorialPhoto(false, true)).toBe(false);
		expect(showMemorialPhoto(false, false)).toBe(false);
	});

	it('shows a photo only when the flag is on and the entry has one', () => {
		expect(showMemorialPhoto(true, true)).toBe(true);
		expect(showMemorialPhoto(true, false)).toBe(false);
	});
});

describe('memorialCountView and the 100 limit', () => {
	it('uses total, and shows shown/total when the response disagrees', () => {
		expect(memorialCountView(0, 0)).toEqual({ kind: 'none' });
		expect(memorialCountView(20, 20)).toEqual({ kind: 'count', total: 20 });
		expect(memorialCountView(20, 100)).toEqual({ kind: 'partial', shown: 20, total: 100 });
	});

	it('treats a total of 100 as full even when only 20 items are rendered', () => {
		expect(isMemorialFull(99)).toBe(false);
		expect(isMemorialFull(100)).toBe(true);
	});
});
