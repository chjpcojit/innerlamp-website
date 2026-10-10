import { lunarToSolar, solarToLunar } from '$lib/utils/lunar';
import type { MemorialEntry, NextAnniversary } from '$lib/types/memorial';

const DAY_MS = 864e5;

/** Next occurrence of an entry's anniversary on or after `today`. */
export function nextAnniversary(
	entry: Pick<MemorialEntry, 'calendar' | 'day' | 'month' | 'year'>,
	today = new Date()
): NextAnniversary {
	const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const candidates: [Date, number][] = [];
	if (entry.calendar === 'lunar') {
		const ly = solarToLunar(t0).year;
		for (const y of [ly - 1, ly, ly + 1]) {
			const d = lunarToSolar(entry.day, entry.month, y);
			if (d) candidates.push([d, y]);
		}
	} else {
		for (const y of [t0.getFullYear(), t0.getFullYear() + 1]) {
			// Clamp so 29/2 or 31/x lands on the month's last day in years that lack it.
			const last = new Date(y, entry.month, 0).getDate();
			candidates.push([new Date(y, entry.month - 1, Math.min(entry.day, last)), y]);
		}
	}
	const [date, year] = candidates.find(([d]) => d >= t0) ?? candidates[candidates.length - 1];
	return {
		date,
		days: Math.round((date.getTime() - t0.getTime()) / DAY_MS),
		nth: entry.year ? year - entry.year : null
	};
}
