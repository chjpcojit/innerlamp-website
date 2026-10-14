import { apiCall } from './client';
import type { CalendarEntry, CalendarListItem, CalendarYear } from '$lib/types/calendar';

type Fetch = typeof globalThis.fetch;

// The payload is the same for every user and changes rarely (backend sends a 24h private
// max-age), so cache per year on the server instead of re-fetching on every page load.
const CACHE_TTL_MS = 60 * 60_000;
const cache = new Map<number, { data: CalendarYear; expiresAt: number }>();

/**
 * Events and occurrences for a whole solar year. Needs the user's access token (the route
 * ignores `x-api-key` alone and answers 401). Throws `ApiError` with `INVALID_YEAR`
 * (`details.field = "year"`, valid 1900–2100), `UNAUTHORIZED` or `INTERNAL_ERROR`.
 * Omit `year` for the current year in Asia/Ho_Chi_Minh; `data.year` says which was used.
 */
export async function getCalendarYear(
	fetch: Fetch,
	token: string,
	year?: number
): Promise<CalendarYear> {
	const now = Date.now();
	if (year !== undefined) {
		const hit = cache.get(year);
		if (hit && hit.expiresAt > now) return hit.data;
	}

	const qs = year === undefined ? '' : `?year=${year}`;
	const data = await apiCall<CalendarYear>(fetch, `/v1/calendar/events${qs}`, { token });

	for (const [key, entry] of cache) if (entry.expiresAt <= now) cache.delete(key);
	cache.set(data.year, { data, expiresAt: now + CACHE_TTL_MS });
	return data;
}

/**
 * Joins occurrences to their events (occurrences keep their `solar_date` order). Pass
 * `group` (e.g. `buddhist`) to keep only events in that group. Occurrences whose event is
 * missing are dropped.
 */
export function listCalendarEntries(calendar: CalendarYear, group?: string): CalendarEntry[] {
	const events = new Map(calendar.events.map((event) => [event.code, event]));
	const entries: CalendarEntry[] = [];
	for (const occurrence of calendar.occurrences) {
		const event = events.get(occurrence.event_code);
		if (!event || (group && !event.groups.includes(group))) continue;
		entries.push({
			event,
			solar_date: occurrence.solar_date,
			lunar_date: occurrence.lunar_date
		});
	}
	return entries;
}

/** Slim list items for entries, which drop the long texts so they are cheap to ship. */
export function toListItems(entries: CalendarEntry[]): CalendarListItem[] {
	return entries.map(({ event, solar_date, lunar_date }) => ({
		code: event.code,
		name: event.name,
		solar_date,
		lunar_date,
		is_public_holiday: event.is_public_holiday,
		groups: event.groups
	}));
}

/** Entries of one solar month (1–12) as slim list items, in date order. */
export function listMonthItems(
	calendar: CalendarYear,
	month: number,
	group?: string
): CalendarListItem[] {
	const prefix = `${calendar.year}-${String(month).padStart(2, '0')}-`;
	return toListItems(
		listCalendarEntries(calendar, group).filter((entry) => entry.solar_date.startsWith(prefix))
	);
}
