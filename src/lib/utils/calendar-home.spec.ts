import { describe, expect, it } from 'vitest';
import type { CalendarListItem } from '$lib/types/calendar';
import { buildHomeBlock, pickHomeRows } from './calendar-home';

const item = (code: string, solar_date: string, groups = ['buddhist']): CalendarListItem =>
	({ code, name: code, solar_date, sort_order: 1, groups }) as unknown as CalendarListItem;

// October: 6 occurrences (any group), 2 already passed on 2026-10-10. No group filter.
const october = [
	item('d-20', '2026-10-20'),
	item('d-01', '2026-10-01'),
	item('d-25', '2026-10-25'),
	item('d-05', '2026-10-05'),
	item('d-12', '2026-10-12'),
	item('d-31', '2026-10-31')
];

describe('pickHomeRows', () => {
	it('shows the 3 nearest upcoming rows and "+N" = month total minus 3 (passed days counted)', () => {
		const { shown, more } = pickHomeRows(october, '2026-10-10');
		expect(shown.map((i) => i.code)).toEqual(['d-12', 'd-20', 'd-25']);
		expect(more).toBe(3); // 6 in the month − 3 shown
	});

	it('does not filter by group: every group is shown and counted', () => {
		const mixed = [
			...october,
			item('holiday', '2026-10-15', ['vietnam']),
			item('folk', '2026-10-16', ['folk'])
		];
		const { shown, more } = pickHomeRows(mixed, '2026-10-10');
		expect(shown.map((i) => i.code)).toEqual(['d-12', 'holiday', 'folk']);
		expect(more).toBe(5); // 8 in the month − 3 shown
	});

	it('counts today as upcoming', () => {
		expect(pickHomeRows(october, '2026-10-12').shown[0].code).toBe('d-12');
	});

	it('shows fewer rows when fewer than 3 are upcoming, and the total still includes the rest', () => {
		const { shown, more } = pickHomeRows(october, '2026-10-26');
		expect(shown.map((i) => i.code)).toEqual(['d-31']);
		expect(more).toBe(5);
	});

	it('shows no row but still counts the month when every day has passed', () => {
		expect(pickHomeRows(october, '2026-11-01')).toEqual({ shown: [], more: 6 });
	});

	it('returns nothing for an empty month', () => {
		expect(pickHomeRows([], '2026-10-10')).toEqual({ shown: [], more: 0 });
	});
});

describe('buildHomeBlock', () => {
	it('builds one card for the start month and ignores other months', () => {
		const cards = buildHomeBlock(
			[...october, item('nov', '2026-11-02')],
			{ year: 2026, month: 10 },
			'2026-10-10'
		);
		expect(cards).toHaveLength(1);
		expect(cards[0]).toMatchObject({ year: 2026, month: 10, more: 3, failed: false });
	});
});
