import { ApiError } from '$lib/server/api/client';
import { getCalendarYear, listCalendarEntries, toListItems } from '$lib/server/api/calendar';
import { vietnamYear } from '$lib/utils/calendar-time';
import type { CalendarGroup, CalendarListItem } from '$lib/types/calendar';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	// The calendar route is public: no token, same list for everyone. Later years load on demand
	// through `/api/calendar/year`.
	const year = vietnamYear();
	try {
		const { calendar, stale } = await getCalendarYear(fetch, year);
		return {
			state: 'ok' as const,
			year: calendar.year,
			groups: calendar.groups,
			items: toListItems(listCalendarEntries(calendar)),
			stale
		};
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return {
			state: 'unavailable' as const,
			year,
			groups: [] as CalendarGroup[],
			items: [] as CalendarListItem[],
			stale: false
		};
	}
};
