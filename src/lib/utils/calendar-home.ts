import type { CalendarListItem, HomeBlockMonth } from '$lib/types/calendar';
import { compareOccurrences } from './calendar-order';

/** Rows per month card. */
export const HOME_BLOCK_ROWS = 3;
/** Month cards in the block: the current month only (owner decision 2026-10-18). */
export const HOME_BLOCK_MONTHS = 1;

/**
 * Rows of one month card: the occurrences of that month, every group (no group filter), no
 * date filter (past days included), in BR-CAL-12 order, at most `HOME_BLOCK_ROWS`. `more` is the
 * month's total minus the rows shown: 6 in the month, 3 shown → 3; 3 or fewer → 0.
 */
export function pickHomeRows(monthItems: CalendarListItem[]): {
	shown: CalendarListItem[];
	more: number;
} {
	const shown = [...monthItems].sort(compareOccurrences).slice(0, HOME_BLOCK_ROWS);
	return { shown, more: monthItems.length - shown.length };
}

/** Month cards from `start` (year, month 1–12) for `months` months, crossing the year end. */
export function buildHomeBlock(
	items: CalendarListItem[],
	start: { year: number; month: number },
	months = HOME_BLOCK_MONTHS
): HomeBlockMonth[] {
	return Array.from({ length: months }, (_, i) => {
		const index = start.year * 12 + (start.month - 1) + i;
		const year = Math.floor(index / 12);
		const month = (index % 12) + 1;
		const prefix = `${year}-${String(month).padStart(2, '0')}-`;
		const { shown, more } = pickHomeRows(items.filter((e) => e.solar_date.startsWith(prefix)));
		return { year, month, shown, more, failed: false };
	});
}
