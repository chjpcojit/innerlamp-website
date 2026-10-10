import type { Relation } from '$lib/content/memorial';

export type MemorialCalendar = 'lunar' | 'solar';

/** One relative in the memorial book (sổ giỗ chạp). */
export interface MemorialEntry {
	id: string;
	name: string;
	relation: Relation;
	calendar: MemorialCalendar;
	/** Day / month of death in `calendar`. */
	day: number;
	month: number;
	/** Year of death, if known. */
	year: number | null;
	note: string;
	remind: boolean;
	/** Days before the anniversary. */
	lead: number;
	/** "HH:MM" */
	time: string;
	/** Re-add the reminder to the calendar each year. */
	sync: boolean;
}

export interface NextAnniversary {
	date: Date;
	/** Whole days from today (0 = today). */
	days: number;
	/** Which anniversary this is (1 = first, 2 = second…); null when the year is unknown. */
	nth: number | null;
}
