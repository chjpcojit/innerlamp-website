import { ApiError, apiCall } from './client';
import type {
	TempleEventEntry,
	TempleEventQuery,
	TempleEventWindow
} from '$lib/types/temple-event';

type Fetch = typeof globalThis.fetch;

/**
 * A temple's upcoming events within a window of at most 3 months. Needs the user's access
 * token (401 `UNAUTHORIZED` without it). Not cached: the backend drops occurrences that
 * already ended, so the result depends on "now". Throws `ApiError` with `INVALID_DATE`
 * (`details.field = "from" | "to"`, bad format or year outside 1900–2100),
 * `INVALID_DATE_RANGE` (`to` < `from`), `DATE_RANGE_TOO_LARGE` (> 3 months) or 404
 * `TEMPLE_NOT_FOUND`. Dates are validated before the temple is looked up.
 */
export const listTempleEvents = (
	fetch: Fetch,
	token: string,
	templeId: string,
	{ from, to }: TempleEventQuery = {}
) => {
	const params = new URLSearchParams();
	if (from) params.set('from', from);
	if (to) params.set('to', to);
	const qs = params.size ? `?${params}` : '';
	return apiCall<TempleEventWindow>(
		fetch,
		`/v1/temples/${encodeURIComponent(templeId)}/events${qs}`,
		{ token }
	);
};

/**
 * Joins occurrences to their events (occurrences keep the backend order). Occurrences
 * whose event is missing are dropped.
 */
export function listTempleEventEntries(window: TempleEventWindow): TempleEventEntry[] {
	const events = new Map(window.events.map((event) => [event.id, event]));
	const entries: TempleEventEntry[] = [];
	for (const { event_id, ...occurrence } of window.occurrences) {
		const event = events.get(event_id);
		if (event) entries.push({ event, ...occurrence });
	}
	return entries;
}

/** First and last day (`YYYY-MM-DD`) of the current month in Vietnam, the backend's zone. */
function currentMonthWindow(): TempleEventQuery {
	const [y, mo] = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Ho_Chi_Minh',
		year: 'numeric',
		month: '2-digit'
	})
		.format(new Date())
		.split('-')
		.map(Number);
	const pad = (n: number) => String(n).padStart(2, '0');
	const lastDay = new Date(Date.UTC(y, mo, 0)).getUTCDate();
	return { from: `${y}-${pad(mo)}-01`, to: `${y}-${pad(mo)}-${pad(lastDay)}` };
}

/**
 * A temple's remaining events this month, joined and ready to render. Any backend failure
 * (401, 404, outage) yields `[]` so the events block reads as "no events" instead of
 * breaking the page around it.
 */
export async function listCurrentMonthEntries(
	fetch: Fetch,
	token: string,
	templeId: string
): Promise<TempleEventEntry[]> {
	try {
		return listTempleEventEntries(
			await listTempleEvents(fetch, token, templeId, currentMonthWindow())
		);
	} catch (e) {
		if (e instanceof ApiError) return [];
		throw e;
	}
}
