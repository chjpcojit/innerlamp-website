import { ApiError } from '$lib/server/api/client';
import { listCurrentMonthEntries } from '$lib/server/api/temple-events';
import { listTempleScheduleItems } from '$lib/server/api/temple-schedule';
import { getTemple, getTopTemples } from '$lib/server/api/temples';
import { getMe } from '$lib/server/api/users';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import { setSanghaTemple } from '$lib/features/sangha/server/set-temple';
import type { TempleSummary } from '$lib/types/temple';
import type { TempleEventEntry } from '$lib/types/temple-event';
import type { TempleScheduleItem } from '$lib/types/temple-schedule';
import type { Actions, PageServerLoad } from './$types';

/** Featured temples offered when the user has no practice temple, as in the design. */
const SUGGESTION_COUNT = 4;

export const load: PageServerLoad = async ({ locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	const empty = {
		profile: null,
		templeImage: null,
		events: [] as TempleEventEntry[],
		schedule: [] as TempleScheduleItem[],
		suggestions: [] as TempleSummary[]
	};
	if (!locals.user || !token) return empty;

	try {
		const profile = await getMe(fetch, token);
		const templeId = profile.ordination_temple?.id;
		if (!templeId) {
			const suggestions = await getTopTemples(fetch).then(
				(t) => t.items.slice(0, SUGGESTION_COUNT),
				(e) => {
					if (!(e instanceof ApiError)) throw e;
					return [];
				}
			);
			return { ...empty, profile, suggestions };
		}

		// The profile only carries the temple's id/name; the hero image comes from the temple detail.
		const [templeImage, events, schedule] = await Promise.all([
			getTemple(fetch, templeId).then(
				(t) => t.image_url,
				(e) => {
					if (!(e instanceof ApiError)) throw e;
					return null;
				}
			),
			listCurrentMonthEntries(fetch, token, templeId),
			listTempleScheduleItems(fetch, token, templeId)
		]);
		return { ...empty, profile, templeImage, events, schedule };
	} catch (e) {
		// Keep the page usable with the name cached at login if the profile can't be loaded.
		if (!(e instanceof ApiError)) throw e;
		return empty;
	}
};

export const actions: Actions = {
	setSangha: setSanghaTemple
};
