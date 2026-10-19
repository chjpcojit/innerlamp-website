import { json } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getCalendarYear, listCalendarEntries, toListItems } from '$lib/server/api/calendar';
import { vietnamYear } from '$lib/utils/calendar-time';
import type { RequestHandler } from './$types';

/** Last year the calendar can be browsed to (product FR-CAL-004). */
const MAX_YEAR = 2100;

/**
 * Browser-facing "load more years" for `/events`: `?year=YYYY` → `{ year, groups, items, stale }`.
 * Only years from the current one up to 2100; the server calls the backend, never the browser.
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
	const raw = url.searchParams.get('year') ?? '';
	const year = /^\d{4}$/.test(raw) ? Number(raw) : NaN;
	if (!(year >= vietnamYear() && year <= MAX_YEAR))
		return json({ error: 'INVALID_YEAR' }, { status: 400 });

	try {
		const { calendar, stale } = await getCalendarYear(fetch, year);
		return json({
			year: calendar.year,
			groups: calendar.groups,
			items: toListItems(listCalendarEntries(calendar)),
			stale
		});
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: 502 });
	}
};
