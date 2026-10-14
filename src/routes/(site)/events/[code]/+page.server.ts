import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getCalendarYear, listCalendarEntries } from '$lib/server/api/calendar';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type {
	CalendarEntry,
	CalendarEventDetail,
	CalendarNeighbour,
	CalendarYear
} from '$lib/types/calendar';
import type { PageServerLoad } from './$types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** Today in Vietnam as `YYYY-MM-DD`, which is how the backend defines "this year". */
function vietnamToday(): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Ho_Chi_Minh',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(new Date());
}

const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

const toNeighbour = (e: CalendarEntry | undefined): CalendarNeighbour | null =>
	e
		? { code: e.event.code, name: e.event.name, solar_date: e.solar_date, lunar_date: e.lunar_date }
		: null;

/** Entries of an adjacent year, or `[]` when it can't be loaded (neighbours are optional). */
async function adjacentEntries(
	fetch: typeof globalThis.fetch,
	token: string,
	year: number
): Promise<CalendarEntry[]> {
	try {
		return listCalendarEntries(await getCalendarYear(fetch, token, year));
	} catch (e) {
		if (e instanceof ApiError) return [];
		throw e;
	}
}

export const load: PageServerLoad = async ({ params, url, locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	// The calendar API needs the user's token, so guests get a sign-in prompt instead.
	if (!locals.user || !token) return { guest: true as const, detail: null };

	const today = vietnamToday();
	const dateParam = url.searchParams.get('date');
	const wanted = dateParam && ISO_DATE.test(dateParam) ? dateParam : null;
	const year = Number((wanted ?? today).slice(0, 4));

	let calendar: CalendarYear;
	try {
		calendar = await getCalendarYear(fetch, token, year);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		if (e.code === 'INVALID_YEAR') error(404, 'Event not found');
		if (e.status === 401) return { guest: true as const, detail: null };
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
	const prevEntry =
		entries[index - 1] ?? (await adjacentEntries(fetch, token, calendar.year - 1)).at(-1);
	const nextEntry =
		entries[index + 1] ?? (await adjacentEntries(fetch, token, calendar.year + 1))[0];

	const groupNames = new Map(calendar.groups.map((g) => [g.code, g.name]));
	const detail: CalendarEventDetail = {
		event: chosen.event,
		group_names: chosen.event.groups.map((code) => groupNames.get(code) ?? code),
		solar_date: chosen.solar_date,
		lunar_date: chosen.lunar_date,
		days_left: Math.round((utc(chosen.solar_date) - utc(today)) / DAY_MS),
		prev: toNeighbour(prevEntry),
		next: toNeighbour(nextEntry)
	};
	return { guest: false as const, detail };
};
