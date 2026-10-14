import { error } from '@sveltejs/kit';
import { setSanghaTemple } from '$lib/features/sangha/server/set-temple';
import { ApiError } from '$lib/server/api/client';
import { listCurrentMonthEntries } from '$lib/server/api/temple-events';
import { getTemple } from '$lib/server/api/temples';
import { getMe } from '$lib/server/api/users';
import { TOKEN_COOKIE } from '$lib/server/auth/session';
import type { TempleEventEntry } from '$lib/types/temple-event';
import type { Actions, PageServerLoad } from './$types';

type SanghaTemple = { id: string; name: string } | null;

export const load: PageServerLoad = async ({ params, locals, cookies, fetch }) => {
	const token = cookies.get(TOKEN_COOKIE);
	const signedIn = Boolean(locals.user && token);
	// The events API needs the user's token; guests get an empty list ("no events").
	const events: Promise<TempleEventEntry[]> =
		signedIn && token ? listCurrentMonthEntries(fetch, token, params.id) : Promise.resolve([]);
	// The user's practice temple drives the "set as my sangha" card; the profile is cached,
	// and a failure only hides which temple is current.
	const sanghaTemple: Promise<SanghaTemple> =
		signedIn && token
			? getMe(fetch, token).then(
					(p) => p.ordination_temple ?? null,
					(e) => {
						if (!(e instanceof ApiError)) throw e;
						return null;
					}
				)
			: Promise.resolve(null);

	try {
		const temple = await getTemple(fetch, params.id);
		return { temple, events: await events, sanghaTemple: await sanghaTemple };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		if (e.status === 404) error(404);
		error(502, 'Backend API error');
	}
};

export const actions: Actions = {
	setSangha: setSanghaTemple
};
