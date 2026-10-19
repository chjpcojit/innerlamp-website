import { json } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getCalendarYear, listMonthItems } from '$lib/server/api/calendar';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

/** Same range the backend accepts for `year`. */
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/**
 * Browser-facing proxy for the lunar calendar's month navigation: `?month=YYYY-MM` →
 * `{ items: CalendarListItem[] }`. The calendar route is public; the lunar page still limits
 * it to signed-in visitors, so guests get 401.
 */
export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
	const match = /^(\d{4})-(\d{2})$/.exec(url.searchParams.get('month') ?? '');
	const year = Number(match?.[1]);
	const month = Number(match?.[2]);
	if (!match || year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12)
		return json({ error: 'INVALID_MONTH' }, { status: 400 });

	const token = cookies.get(TOKEN_COOKIE);
	if (!token) return json({ error: 'UNAUTHORIZED' }, { status: 401 });

	try {
		return json({ items: listMonthItems((await getCalendarYear(fetch, year)).calendar, month) });
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: e.status >= 400 && e.status < 600 ? e.status : 502 });
	}
};
