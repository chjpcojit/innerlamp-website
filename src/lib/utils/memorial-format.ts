import { m } from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime';
import { LUNAR_MONTH_LABELS, RELATION_LABELS } from '$lib/content/memorial';
import type { MemorialEntry } from '$lib/types/memorial';

const pad = (n: number) => String(n).padStart(2, '0');

/** "Saturday, 10/10/2026" in the active locale. */
export function longDate(date: Date): string {
	const weekday = new Intl.DateTimeFormat(getLocale(), { weekday: 'long' }).format(date);
	return `${weekday}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function lunarMonthLabel(month: number): string {
	return LUNAR_MONTH_LABELS[month - 1]();
}

/** Date of death as the family writes it: "23 tháng Tám âm lịch" or "14/12 dương lịch". */
export function deathDateLabel(e: Pick<MemorialEntry, 'calendar' | 'day' | 'month'>): string {
	return e.calendar === 'lunar'
		? m.mem_date_lunar({ day: e.day, month: lunarMonthLabel(e.month) })
		: m.mem_date_solar({ date: `${pad(e.day)}/${pad(e.month)}` });
}

export function daysLabel(days: number): string {
	if (days === 0) return m.mem_today();
	if (days === 1) return m.mem_tomorrow();
	return m.mem_in_days({ count: days });
}

/** "Giỗ đầu" / "Giỗ hết" / "Giỗ lần thứ N"; empty when unknown. */
export function nthLabel(nth: number | null): string {
	if (nth == null || nth < 1) return '';
	if (nth === 1) return m.mem_nth_first();
	if (nth === 2) return m.mem_nth_second();
	return m.mem_nth_other({ n: nth });
}

export function remindLabel(e: MemorialEntry): string {
	if (!e.remind) return m.mem_remind_off();
	const when = e.lead ? m.mem_remind_before({ count: e.lead }) : m.mem_remind_on_day();
	return [when + ' · ' + e.time, e.sync ? m.mem_remind_in_calendar() : '']
		.filter(Boolean)
		.join(' · ');
}

export function relationLabel(e: Pick<MemorialEntry, 'relation'>): string {
	return RELATION_LABELS[e.relation]();
}
