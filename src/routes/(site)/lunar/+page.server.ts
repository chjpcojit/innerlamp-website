import { ApiError } from '$lib/server/api/client';
import { getCalendarYear, listMonthItems } from '$lib/server/api/calendar';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { CalendarListItem } from '$lib/types/calendar';
import type { PageServerLoad } from './$types';

/** Today in Vietnam as `YYYY-MM-DD`, which is how the backend defines "this year". */
function vietnamToday(): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Ho_Chi_Minh',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(new Date());
}

/**
 * Events of the month the calendar opens on (`?date=` or this month), so the first paint has
 * them. Later months are fetched by the page through `/api/calendar/month`.
 */
export const load: PageServerLoad = async ({ locals, cookies, fetch, url }) => {
	const date = url.searchParams.get('date');
	const month = (date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : vietnamToday()).slice(0, 7);

	const token = cookies.get(TOKEN_COOKIE);
	// The lunar page still hides events from guests (the calendar route itself is public).
	if (!locals.user || !token) return { isGuest: true, events: { month, items: null } };

	let items: CalendarListItem[] | null = null;
	try {
		const [y, mo] = month.split('-').map(Number);
		items = listMonthItems((await getCalendarYear(fetch, y)).calendar, mo);
	} catch (e) {
		// Never break the calendar over the backend: the events panel shows "unavailable".
		if (!(e instanceof ApiError)) throw e;
	}
	return { isGuest: false, events: { month, items } };
};
