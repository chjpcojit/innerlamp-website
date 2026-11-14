import { json } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getCalendarImage } from '$lib/server/api/calendar';
import type { RequestHandler } from './$types';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

/**
 * Browser-facing proxy for the Buddha image of a day: `?date=YYYY-MM-DD` → `CalendarDayImage`.
 * Public (the image is not tied to a signed-in visitor); the backend URL and key stay on the server.
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
	const raw = url.searchParams.get('date') ?? '';
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
	const [year, month, day] = [Number(match?.[1]), Number(match?.[2]), Number(match?.[3])];
	const valid =
		match &&
		year >= MIN_YEAR &&
		year <= MAX_YEAR &&
		new Date(Date.UTC(year, month - 1, day)).toISOString().startsWith(raw);
	if (!valid) return json({ error: 'INVALID_DATE' }, { status: 400 });

	try {
		return json(await getCalendarImage(fetch, raw), {
			headers: { 'Cache-Control': 'public, max-age=86400' }
		});
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return json({ error: e.code }, { status: e.status >= 400 && e.status < 600 ? e.status : 502 });
	}
};
