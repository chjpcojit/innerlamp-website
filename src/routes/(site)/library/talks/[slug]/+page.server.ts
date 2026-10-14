import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { getDharmaTalk, listDharmaTalks } from '$lib/server/api/dharma-talks';
import type { DharmaTalkSummary } from '$lib/types/dharma-talk';
import type { PageServerLoad } from './$types';

type Fetch = typeof globalThis.fetch;

const RELATED_COUNT = 4;

/** First catalogue page; empty when the backend cannot deliver it (never fails the page). */
async function loadCatalogue(fetch: Fetch): Promise<DharmaTalkSummary[]> {
	try {
		return (await listDharmaTalks(fetch)).items;
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		return [];
	}
}

export const load: PageServerLoad = async ({ params, fetch }) => {
	const catalogue = loadCatalogue(fetch);
	let talk;
	try {
		talk = await getDharmaTalk(fetch, params.slug);
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		if (e.status === 404) error(404);
		error(502, 'Backend API error');
	}

	// The API cannot filter by category: rank same-category talks first within page 1.
	const others = (await catalogue).filter((t) => t.id !== talk.id);
	const related = [
		...others.filter((t) => t.category === talk.category),
		...others.filter((t) => t.category !== talk.category)
	].slice(0, RELATED_COUNT);

	return { talk, related };
};
