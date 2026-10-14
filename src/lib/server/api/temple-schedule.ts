import { ApiError, apiCall } from './client';
import type { TempleSchedule, TempleScheduleItem } from '$lib/types/temple-schedule';

type Fetch = typeof globalThis.fetch;

/**
 * A temple's weekly practice schedule. Needs the user's access token (401 `UNAUTHORIZED`
 * without it). Throws `ApiError` with 404 `TEMPLE_NOT_FOUND` for an unknown id.
 */
export const getTempleSchedule = (fetch: Fetch, token: string, templeId: string) =>
	apiCall<TempleSchedule>(fetch, `/v1/temples/${encodeURIComponent(templeId)}/schedule`, {
		token
	});

/**
 * The schedule's sessions, ready to render. Any backend failure yields `[]` so the block
 * reads as "no schedule" instead of breaking the page around it.
 */
export async function listTempleScheduleItems(
	fetch: Fetch,
	token: string,
	templeId: string
): Promise<TempleScheduleItem[]> {
	try {
		return (await getTempleSchedule(fetch, token, templeId)).items;
	} catch (e) {
		if (e instanceof ApiError) return [];
		throw e;
	}
}
