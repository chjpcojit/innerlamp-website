import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compareOccurrences } from './calendar-order';
import { countdown } from './events';

// Product vectors of innerlamp-be docs/product/calendar/rules, pinned by
// scripts/sync-calendar-vectors.mjs (never edited by hand). / Bản pin vector của product spec.
type Case = { name: string; input: Record<string, any>; expected: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
const load = (name: string): { cases: Case[] } =>
	JSON.parse(
		readFileSync(new URL(`../../../tests/vectors/calendar/${name}`, import.meta.url), 'utf8')
	);

describe('countdown.json (BR-CAL-13)', () => {
	const vector = load('countdown.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		expect(countdown(input.today, input.solar_date)).toEqual(expected);
	});
});

describe('ordering.json (BR-CAL-12, BR-CAL-05)', () => {
	const vector = load('ordering.json');
	it.each(vector.cases)('$name', ({ input, expected }) => {
		const occurrences = input.occurrences.map((o: Record<string, unknown>) => ({
			code: o.event as string,
			solar_date: o.solar_date as string,
			sort_order: o.display_order as number
		}));
		expect(occurrences.sort(compareOccurrences).map((o: { code: string }) => o.code)).toEqual(
			expected.order
		);
	});
});
