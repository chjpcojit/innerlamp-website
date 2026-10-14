/** DTOs for the backend calendar API (`/v1/calendar/*`). */

/** A category events can belong to (`buddhist`, `vietnam`, `folk`, …). Backend may add more. */
export interface CalendarGroup {
	code: string;
	/** Display name (Vietnamese only in v1). */
	name: string;
}

/** An event definition. Dates live in `CalendarOccurrence`, joined by `code`. */
export interface CalendarEvent {
	/** Stable slug; the only identifier (there is no numeric id or detail endpoint). */
	code: string;
	name: string;
	short_description: string;
	long_description: string;
	/** Ritual / observance guidance. */
	guidance: string;
	/** Always null in v1. */
	image_url: string | null;
	/** `CalendarGroup.code` values. */
	groups: string[];
	/** True only on the event's own date. */
	is_public_holiday: boolean;
}

export interface LunarDate {
	day: number;
	month: number;
	year: number;
	is_leap_month: boolean;
}

/** One dated occurrence of an event. Monthly events (mùng 1, rằm) have many. */
export interface CalendarOccurrence {
	event_code: string;
	/** `YYYY-MM-DD`. Display by this, not `lunar_date.year` (Chạp events can fall in Jan–Feb). */
	solar_date: string;
	lunar_date: LunarDate;
}

/** Response of `GET /v1/calendar/events?year=`: the whole solar year, sorted by `solar_date`. */
export interface CalendarYear {
	year: number;
	groups: CalendarGroup[];
	events: CalendarEvent[];
	occurrences: CalendarOccurrence[];
}

/** An occurrence joined with its event, ready for rendering. */
export interface CalendarEntry {
	event: CalendarEvent;
	solar_date: string;
	lunar_date: LunarDate;
}

/** Slim occurrence for lists: drops the long texts so it is cheap to ship to the browser. */
export interface CalendarListItem {
	code: string;
	name: string;
	/** `YYYY-MM-DD`. */
	solar_date: string;
	lunar_date: LunarDate;
	is_public_holiday: boolean;
	/** `CalendarGroup.code` values. */
	groups: string[];
}

/** A neighbouring occurrence shown as "previous / next event" on the detail page. */
export interface CalendarNeighbour {
	code: string;
	name: string;
	solar_date: string;
	lunar_date: LunarDate;
}

/** One event occurrence with everything the detail page renders. */
export interface CalendarEventDetail {
	event: CalendarEvent;
	/** Display names of the event's groups (`buddhist` → "Phật giáo"), in backend order. */
	group_names: string[];
	solar_date: string;
	lunar_date: LunarDate;
	/** Whole days from today (Vietnam time) to `solar_date`; negative when past. */
	days_left: number;
	prev: CalendarNeighbour | null;
	next: CalendarNeighbour | null;
}
