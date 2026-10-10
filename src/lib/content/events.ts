import { m } from '$lib/paraglide/messages';
import { LUNAR_MONTHS } from '$lib/content/home';
import { lunarToSolar } from '$lib/utils/lunar';

export type EventKind = 'grand' | 'buddha' | 'bodhisattva' | 'observance';

export interface EventKindStyle {
	label: () => string;
	/** Full Tailwind class strings so the compiler can see them. */
	tag: string;
	bar: string;
	name: string;
}

export const EVENT_KINDS: Record<EventKind, EventKindStyle> = {
	grand: {
		label: () => m.ev_kind_grand(),
		tag: 'bg-gold/16 text-gold-deep',
		bar: 'bg-gold',
		name: 'text-gold-deep'
	},
	buddha: {
		label: () => m.ev_kind_buddha(),
		tag: 'bg-[#c64545]/10 text-[#9e3b2c]',
		bar: 'bg-[#c0573f]',
		name: 'text-[#9e3b2c]'
	},
	bodhisattva: {
		label: () => m.ev_kind_bodhisattva(),
		tag: 'bg-[#5e8a6c]/14 text-[#3f6b4e]',
		bar: 'bg-[#5e8a6c]',
		name: 'text-[#3f6b4e]'
	},
	observance: {
		label: () => m.ev_kind_observance(),
		tag: 'bg-ink/6 text-ink/60',
		bar: 'bg-sand-deep',
		name: 'text-ink'
	}
};

/** Tab order on the events page; `null` kinds means "all". */
export const EVENT_TABS: { id: string; label: () => string; kinds: EventKind[] | null }[] = [
	{ id: 'all', label: () => m.ev_tab_all(), kinds: null },
	{ id: 'grand', label: () => m.ev_kind_grand(), kinds: ['grand'] },
	{ id: 'buddha', label: () => m.ev_kind_buddha(), kinds: ['buddha'] },
	{ id: 'bodhisattva', label: () => m.ev_kind_bodhisattva(), kinds: ['bodhisattva'] },
	{ id: 'observance', label: () => m.ev_kind_observance(), kinds: ['observance'] }
];

interface Feast {
	day: number;
	/** Lunar month 1–12 */
	month: number;
	kind: EventKind;
	name: () => string;
}

const FEASTS: Feast[] = [
	{ day: 1, month: 1, kind: 'grand', name: () => m.ev_f_1() },
	{ day: 15, month: 1, kind: 'grand', name: () => m.ev_f_2() },
	{ day: 8, month: 2, kind: 'buddha', name: () => m.ev_f_3() },
	{ day: 15, month: 2, kind: 'buddha', name: () => m.ev_f_4() },
	{ day: 19, month: 2, kind: 'bodhisattva', name: () => m.ev_f_5() },
	{ day: 21, month: 2, kind: 'bodhisattva', name: () => m.ev_f_6() },
	{ day: 4, month: 4, kind: 'bodhisattva', name: () => m.ev_f_7() },
	{ day: 15, month: 4, kind: 'grand', name: () => m.ev_f_8() },
	{ day: 16, month: 4, kind: 'grand', name: () => m.ev_f_9() },
	{ day: 19, month: 6, kind: 'bodhisattva', name: () => m.ev_f_10() },
	{ day: 13, month: 7, kind: 'bodhisattva', name: () => m.ev_f_11() },
	{ day: 15, month: 7, kind: 'grand', name: () => m.ev_f_12() },
	{ day: 30, month: 7, kind: 'bodhisattva', name: () => m.ev_f_13() },
	{ day: 22, month: 8, kind: 'buddha', name: () => m.ev_f_14() },
	{ day: 19, month: 9, kind: 'bodhisattva', name: () => m.ev_f_15() },
	{ day: 30, month: 9, kind: 'buddha', name: () => m.ev_f_16() },
	{ day: 5, month: 10, kind: 'bodhisattva', name: () => m.ev_f_17() },
	{ day: 17, month: 11, kind: 'buddha', name: () => m.ev_f_18() },
	{ day: 8, month: 12, kind: 'buddha', name: () => m.ev_f_19() }
];

export interface BuddhistEvent {
	date: Date;
	lunarDay: number;
	lunarMonth: number;
	kind: EventKind;
	name: string;
}

/** All Buddhist feast days plus the 1st / 15th of every lunar month, for a lunar year. */
export function buildYearEvents(lunarYear: number): BuddhistEvent[] {
	const events: BuddhistEvent[] = [];
	const add = (day: number, month: number, kind: EventKind, name: string) => {
		const date = lunarToSolar(day, month, lunarYear);
		if (date) events.push({ date, lunarDay: day, lunarMonth: month, kind, name });
	};
	for (const f of FEASTS) add(f.day, f.month, f.kind, f.name());
	for (let month = 1; month <= 12; month++) {
		for (const day of [1, 15]) {
			if (FEASTS.some((f) => f.day === day && f.month === month)) continue;
			const label = LUNAR_MONTHS[month - 1]();
			add(
				day,
				month,
				'observance',
				day === 1 ? m.ev_new_moon({ month: label }) : m.ev_full_moon({ month: label })
			);
		}
	}
	return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}
