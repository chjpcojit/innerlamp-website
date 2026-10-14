import { getLocale } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages';

const DAY_MS = 86_400_000;

/** Whole days from `from` (a local midnight) to `to`; negative when `to` is earlier. */
export function daysBetween(from: Date, to: Date): number {
	return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export function leftLabel(days: number): string {
	if (days === 0) return m.ev_left_today();
	return days > 0 ? m.ev_left_days({ count: days }) : m.ev_left_past();
}

/** Short month label for the date badge, e.g. "thg 10" / "Oct". */
export function monthShort(date: Date): string {
	return new Intl.DateTimeFormat(getLocale(), { month: 'short' }).format(date);
}

/** Local-midnight Date of a `YYYY-MM-DD` string (no timezone shift). */
export function parseIsoDate(iso: string): Date {
	const [y, mo, d] = iso.split('-').map(Number);
	return new Date(y, mo - 1, d);
}
