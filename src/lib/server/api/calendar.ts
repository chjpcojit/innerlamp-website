import { ApiError, apiCall } from './client';
import type { CalendarEntry, CalendarListItem, CalendarYear } from '$lib/types/calendar';

type Fetch = typeof globalThis.fetch;

// The payload is the same for every visitor and changes rarely (the backend answers a public
// 24h max-age), so cache per year on the server instead of re-fetching on every page load.
// An expired entry is kept: it is the "website copy" served when the backend fails.
const CACHE_TTL_MS = 60 * 60_000;
/** Wait after a 429 that carries no `retry_after_seconds`. */
const DEFAULT_RETRY_AFTER_S = 60;
const cache = new Map<number, { data: CalendarYear | null; fetchedAt: number; retryAt: number }>();

export interface CalendarResult {
	calendar: CalendarYear;
	/** True when the backend failed and this is the last good copy. */
	stale: boolean;
}

/**
 * Events and occurrences for a whole solar year (`year` is always explicit so the backend
 * answers `Cache-Control: public`). Public route: only `x-api-key`, never a user token;
 * a request with the right key is not counted by the backend's per-IP limit. Throws
 * `ApiError` with `INVALID_YEAR` (valid 1900–2100), `INVALID_API_KEY` (401), `RATE_LIMITED`
 * (429) or `INTERNAL_ERROR`, but only when there is no old copy to fall back to.
 */
export async function getCalendarYear(fetch: Fetch, year: number): Promise<CalendarResult> {
	const now = Date.now();
	const hit = cache.get(year);
	if (hit?.data && now - hit.fetchedAt < CACHE_TTL_MS && hit.retryAt <= now) {
		return { calendar: hit.data, stale: false };
	}
	// Backing off after a 429: do not ask the backend again for this year yet.
	if (hit && hit.retryAt > now) {
		if (hit.data) return { calendar: hit.data, stale: true };
		throw new ApiError(429, 'RATE_LIMITED');
	}

	try {
		const data = await apiCall<CalendarYear>(fetch, `/v1/calendar/events?year=${year}`);
		cache.set(year, { data, fetchedAt: now, retryAt: 0 });
		return { calendar: data, stale: false };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		if (e.status === 429) {
			const seconds = Number(e.details.retry_after_seconds);
			const wait = Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_S;
			cache.set(year, {
				data: hit?.data ?? null,
				fetchedAt: hit?.fetchedAt ?? 0,
				retryAt: now + wait * 1000
			});
		}
		if (hit?.data) return { calendar: hit.data, stale: true };
		throw e;
	}
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
		is_major: event.is_major,
		sort_order: event.sort_order,
		recurrence: event.recurrence,
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
