import type { Relation } from '$lib/content/memorial';

export type MemorialCalendar = 'lunar' | 'solar';

/** One relative in the memorial book (sổ giỗ chạp), mapped from the backend DTO. */
export interface MemorialEntry {
	/** Backend integer id (> 0); `String(id)` only when building a route param. */
	id: number;
	name: string;
	relation: Relation;
	calendar: MemorialCalendar;
	/** Day / month of death in `calendar`. */
	day: number;
	month: number;
	/** Year of death in `calendar`; null when unknown. */
	year: number | null;
	/** Died in a leap lunar month (only meaningful when `calendar` is lunar). */
	leap: boolean;
	note: string;
	/** Null = reminder off. Values are the saved ones, not rounded to the UI choices. */
	reminder: { lead: number; time: string } | null;
	/** A portrait exists; the image is proxied at `/memorial/{id}/photo` (never the signed URL). */
	hasPhoto: boolean;
}

/** Form draft: an entry without server-owned fields. */
export type MemorialDraft = Omit<MemorialEntry, 'id' | 'hasPhoto'>;

/** `relationship` enum in the client contract (§2.2), 10 values. */
export type MemorialRelationship =
	| 'GRANDFATHER_PATERNAL'
	| 'GRANDMOTHER_PATERNAL'
	| 'GRANDFATHER_MATERNAL'
	| 'GRANDMOTHER_MATERNAL'
	| 'FATHER'
	| 'MOTHER'
	| 'SPOUSE'
	| 'SIBLING'
	| 'CHILD'
	| 'OTHER';

/** `Memorial` as returned by the backend. Unknown fields are ignored by `src/lib/server/api`. */
export interface MemorialDTO {
	id: number;
	full_name: string;
	relationship: MemorialRelationship;
	death_calendar: MemorialCalendar;
	death_date: string | null;
	death_day: number | null;
	death_month: number | null;
	death_leap_month: boolean | null;
	note: string | null;
	photo_url: string | null;
	reminder: { days_before: number; time: string } | null;
	created_at: string;
	updated_at: string;
	/** v1 also returns these; never read, never write (D3). */
	timezone?: string;
	add_to_os_reminder?: boolean;
}

/** `MemorialRequest`: exactly one date shape, reminder only `{days_before, time}`. */
export interface MemorialRequest {
	full_name: string;
	relationship: MemorialRelationship;
	death_calendar: MemorialCalendar;
	death_date?: string;
	death_day?: number;
	death_month?: number;
	death_leap_month?: boolean;
	note?: string | null;
	reminder?: { days_before: number; time: string } | null;
}

export interface MemorialList {
	items: MemorialDTO[];
	total: number;
}

export interface NextAnniversary {
	date: Date;
	/** Whole days from today (0 = today). */
	days: number;
	/** Which anniversary this is (1 = first, 2 = second…); null when the year is unknown. */
	nth: number | null;
}

/** One-shot message after save/delete, kept in an httpOnly cookie between requests. */
export interface MemorialFlashData {
	kind: 'saved' | 'deleted' | 'gone';
}

/** Field codes returned by the server actions; the form maps each to one Paraglide key. */
export interface MemorialActionErrors {
	name?: 'empty' | 'long';
	note?: 'note_long';
	date?: 'invalid' | 'not_exist' | 'future' | 'year_min';
	reminder?: 'invalid';
	photo?: 'too_large' | 'unsupported' | 'failed';
	form?: 'full' | 'save' | 'delete' | 'auth';
}
