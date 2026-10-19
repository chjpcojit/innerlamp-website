import { getLocale } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages';

const DAY_MS = 86_400_000;

/** Whole days from `from` (a local midnight) to `to`; negative when `to` is earlier. */
export function daysBetween(from: Date, to: Date): number {
	return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export type CountdownLabel = 'today' | 'tomorrow' | 'days_left' | 'passed';

/** Device-local today as `YYYY-MM-DD` (browser only: BR-CAL-13 counts on the device date). */
export function localIsoToday(): string {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const utcDay = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

/**
 * Countdown of an occurrence (BR-CAL-13): `solarDate` minus `today` in whole days, both
 * `YYYY-MM-DD`. 0 → today, 1 → tomorrow, > 1 → days_left, < 0 → passed.
 */
export function countdown(
	today: string,
	solarDate: string
): { days: number; label: CountdownLabel } {
	const days = Math.round((utcDay(solarDate) - utcDay(today)) / DAY_MS);
	const label = days === 0 ? 'today' : days === 1 ? 'tomorrow' : days > 1 ? 'days_left' : 'passed';
	return { days, label };
}

/** Visible text of a countdown (BR-CAL-13 wording lives in `ev_left_*`). */
export function countdownText(c: { days: number; label: CountdownLabel }): string {
	switch (c.label) {
		case 'today':
			return m.ev_left_today();
		case 'tomorrow':
			return m.ev_left_tomorrow();
		case 'days_left':
			return m.ev_left_days({ count: c.days });
		default:
			return m.ev_left_past();
	}
}

/** "N/M âm lịch" of a lunar date, with "nhuận" after the month for a leap month (BR-CAL-08). */
export function lunarDateText(d: { day: number; month: number; is_leap_month: boolean }): string {
	return d.is_leap_month
		? m.ev_lunar_date_leap({ day: d.day, month: d.month })
		: m.ev_lunar_date({ day: d.day, month: d.month });
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
