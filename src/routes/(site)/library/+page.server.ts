import { ApiError } from '$lib/server/api/client';
import { getTopDeities } from '$lib/server/api/deities';
import type { PageServerLoad } from './$types';

/** Cards shown in the library page Buddhas & Bodhisattvas section. */
const LIBRARY_DEITY_COUNT = 6;

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		return { buddhas: (await getTopDeities(fetch)).items.slice(0, LIBRARY_DEITY_COUNT) };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		// Backend down: the grid falls back to the static catalogue.
		return { buddhas: null };
	}
};
