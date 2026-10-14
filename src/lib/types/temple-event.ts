/** DTOs for the backend temple events API (`/v1/temples/{id}/events`). */

import type { LunarDate } from './calendar';

/**
 * Open enums: the backend may add values, so decode as string and tolerate unknown ones.
 * Known values are listed for reference only.
 */
export type TempleEventKind =
	| 'KHOA_TU'
	| 'PHAP_HOI'
	| 'LE_CAU_AN'
	| 'LE_CAU_SIEU'
	| 'LE_HOI'
	| 'THUYET_PHAP'
	| 'KHAC'
	| (string & {});
/** Cancelled / postponed events are still returned; the UI decides how to show them. */
export type TempleEventStatus = 'SCHEDULED' | 'POSTPONED' | 'CANCELLED' | (string & {});
export type TempleEventRecurrenceKind = 'NONE' | 'LUNAR_MONTHLY' | 'WEEKLY' | (string & {});

/** How an event repeats. The backend already expands it into `occurrences`. */
export interface TempleEventRecurrence {
	kind: TempleEventRecurrenceKind;
	/** Lunar days of month for `LUNAR_MONTHLY` (30 falls back to 29 in short months); else `[]`. */
	lunar_days: number[];
	/** Go `time.Weekday` (0 = Sunday) for `WEEKLY`; else null. */
	weekday: number | null;
	/** Last date `YYYY-MM-DD`, or null when open-ended. */
	until: string | null;
}

/** An event definition. Dates live in `TempleEventOccurrence`, joined by `id`. */
export interface TempleEvent {
	id: string;
	/** Text fields are Vietnamese only and never null (may be empty). */
	title: string;
	description: string;
	kind: TempleEventKind;
	is_all_day: boolean;
	status: TempleEventStatus;
	audience_note: string;
	contact_info: string;
	/** Stored as-is by the backend; not verified whether absolute or relative. */
	image_url: string | null;
	recurrence: TempleEventRecurrence;
}

/** One dated occurrence. Occurrences that already ended are dropped by the backend. */
export interface TempleEventOccurrence {
	event_id: string;
	/** RFC 3339 with `+07:00`. All-day events end at 23:59:59 that day. */
	starts_at: string;
	ends_at: string;
	/** `YYYY-MM-DD`. */
	solar_date: string;
	lunar_date: LunarDate;
}

/** `GET /v1/temples/{id}/events`. Only events with an occurrence in the window are listed. */
export interface TempleEventWindow {
	temple_id: string;
	/** The window actually used, `YYYY-MM-DD`, both ends inclusive. */
	from: string;
	to: string;
	events: TempleEvent[];
	/** Sorted by `starts_at`, then `event_id`. */
	occurrences: TempleEventOccurrence[];
}

/** Both optional, `YYYY-MM-DD`. Defaults: `from` = today (Vietnam), `to` = `from` + 3 months. */
export interface TempleEventQuery {
	from?: string;
	/** At most 3 months after `from`. */
	to?: string;
}

/** An occurrence joined to its event, which is what the UI renders. */
export interface TempleEventEntry extends Omit<TempleEventOccurrence, 'event_id'> {
	event: TempleEvent;
}
