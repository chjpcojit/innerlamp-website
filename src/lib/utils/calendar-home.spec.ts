import { describe, expect, it } from 'vitest';
import type { CalendarListItem } from '$lib/types/calendar';
import { buildHomeBlock, pickHomeRows } from './calendar-home';

const item = (code: string, solar_date: string, groups = ['buddhist']): CalendarListItem =>
	({ code, name: code, solar_date, sort_order: 1, groups }) as unknown as CalendarListItem;

// October: 6 occurrences (any group). No group or date filter.
const october = [
	item('d-20', '2026-10-20'),
	item('d-01', '2026-10-01'),
	item('d-25', '2026-10-25'),
	item('d-05', '2026-10-05'),
	item('d-12', '2026-10-12'),
	item('d-31', '2026-10-31')
];

describe('pickHomeRows', () => {
	it('shows the first 3 rows of the month in order and "+N" = month total minus 3', () => {
		const { shown, more } = pickHomeRows(october);
		expect(shown.map((i) => i.code)).toEqual(['d-01', 'd-05', 'd-12']);
		expect(more).toBe(3);
	});

	it('does not filter by group or by date: every row is eligible and counted', () => {
		const mixed = [...october, item('holiday', '2026-10-15', ['vietnam'])];
		const { shown, more } = pickHomeRows(mixed);
		expect(shown.map((i) => i.code)).toEqual(['d-01', 'd-05', 'd-12']);
		expect(more).toBe(4);
	});

	it('shows up to 3 rows and no "+N" when the month has 3 or fewer', () => {
		const { shown, more } = pickHomeRows(october.slice(0, 3));
		expect(shown).toHaveLength(3);
		expect(more).toBe(0);
	});

	it('returns nothing for an empty month', () => {
		expect(pickHomeRows([])).toEqual({ shown: [], more: 0 });
	});
});

describe('buildHomeBlock', () => {
	it('builds one card for the start month and ignores other months', () => {
		const cards = buildHomeBlock([...october, item('nov', '2026-11-02')], {
			year: 2026,
			month: 10
		});
		expect(cards).toHaveLength(1);
		expect(cards[0]).toMatchObject({ year: 2026, month: 10, more: 3, failed: false });
	});
});
