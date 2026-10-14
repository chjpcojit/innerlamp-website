import { ApiError } from '$lib/server/api/client';
import { getCalendarYear, listCalendarEntries, toListItems } from '$lib/server/api/calendar';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { CalendarGroup, CalendarListItem } from '$lib/types/calendar';
import type { PageServerLoad } from './$types';

/** Current year in Vietnam, which is how the backend defines "this year". */
function vietnamYear(): number {
	return Number(
		new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric' }).format(
			new Date()
		)
	);
}

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	const empty = {
		years: [] as number[],
		groups: [] as CalendarGroup[],
		items: [] as CalendarListItem[]
	};
	// The calendar API needs the user's token, so guests get a sign-in prompt instead.
	if (!locals.user || !token) return { state: 'guest' as const, ...empty };

	// The page shows the current year and "load more" reveals the next one.
	const first = vietnamYear();
	const results = await Promise.allSettled(
		[first, first + 1].map((y) => getCalendarYear(fetch, token, y))
	);
	for (const r of results) {
		if (r.status === 'rejected' && !(r.reason instanceof ApiError)) throw r.reason;
	}

	// The current year is required; the next one is a bonus when the backend can't serve it.
	const [current, following] = results;
	if (current.status === 'rejected') {
		const unauthorized = current.reason instanceof ApiError && current.reason.status === 401;
		return { state: unauthorized ? ('guest' as const) : ('unavailable' as const), ...empty };
	}

	const calendars = [current.value, ...(following.status === 'fulfilled' ? [following.value] : [])];
	const groups = new Map<string, CalendarGroup>();
	for (const c of calendars) for (const g of c.groups) groups.set(g.code, g);

	return {
		state: 'ok' as const,
		years: calendars.map((c) => c.year),
		groups: [...groups.values()],
		items: calendars.flatMap((c) => toListItems(listCalendarEntries(c)))
	};
};
