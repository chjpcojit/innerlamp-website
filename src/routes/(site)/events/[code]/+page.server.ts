import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getCalendarYear, listCalendarEntries } from '$lib/server/api/calendar';
import { vietnamToday } from '$lib/utils/calendar-time';
import type {
	CalendarEntry,
	CalendarEventDetail,
	CalendarNeighbour,
	CalendarYear
} from '$lib/types/calendar';
import type { PageServerLoad } from './$types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const toNeighbour = (e: CalendarEntry | undefined): CalendarNeighbour | null =>
	e
		? { code: e.event.code, name: e.event.name, solar_date: e.solar_date, lunar_date: e.lunar_date }
		: null;

/** Entries of an adjacent year, or `[]` when it can't be loaded (neighbours are optional). */
async function adjacentEntries(
	fetch: typeof globalThis.fetch,
	year: number
): Promise<CalendarEntry[]> {
	try {
		return listCalendarEntries((await getCalendarYear(fetch, year)).calendar);
	} catch (e) {
		if (e instanceof ApiError) return [];
		throw e;
	}
}

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	// The calendar route is public: no token, same detail for everyone.
	const today = vietnamToday();
	const dateParam = url.searchParams.get('date');
	const wanted = dateParam && ISO_DATE.test(dateParam) ? dateParam : null;
	const year = Number((wanted ?? today).slice(0, 4));

	let calendar: CalendarYear;
	let stale: boolean;
	try {
		({ calendar, stale } = await getCalendarYear(fetch, year));
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		if (e.code === 'INVALID_YEAR') error(404, 'Event not found');
		error(502, 'Backend API error');
	}

	const entries = listCalendarEntries(calendar);
	const own = entries.filter((e) => e.event.code === params.code);
	if (own.length === 0) error(404, 'Event not found');

	// `?date=` picks one of a monthly event's occurrences; otherwise the next upcoming one.
	const chosen =
		(wanted && own.find((e) => e.solar_date === wanted)) ||
		own.find((e) => e.solar_date >= today) ||
		own[own.length - 1];

	const index = entries.indexOf(chosen);
	const prevEntry = entries[index - 1] ?? (await adjacentEntries(fetch, calendar.year - 1)).at(-1);
	const nextEntry = entries[index + 1] ?? (await adjacentEntries(fetch, calendar.year + 1))[0];

	const groupNames = new Map(calendar.groups.map((g) => [g.code, g.name]));
	const detail: CalendarEventDetail = {
		event: chosen.event,
		group_names: chosen.event.groups.map((code) => groupNames.get(code) ?? code),
		solar_date: chosen.solar_date,
		lunar_date: chosen.lunar_date,
		stale,
		prev: toNeighbour(prevEntry),
		next: toNeighbour(nextEntry)
	};
	return { detail };
};
