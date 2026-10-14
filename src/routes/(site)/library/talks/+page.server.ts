import { redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { listDharmaTalks } from '$lib/server/api/dharma-talks';
import type { PageServerLoad } from './$types';

/** 1-based page from `?page=`; anything that is not a positive integer counts as page 1. */
function parsePage(raw: string | null) {
	const n = Number(raw);
	return Number.isInteger(n) && n >= 1 ? n : 1;
}

export const load: PageServerLoad = async ({ url, fetch }) => {
	const rawPage = url.searchParams.get('page');
	const page = parsePage(rawPage);
	const canonical = (p: number) => (p > 1 ? `${url.pathname}?page=${p}` : url.pathname);

	// Keep the URL canonical: drop junk like `?page=abc` or `?page=0`.
	if (rawPage !== null && String(page) !== rawPage) redirect(307, canonical(page));

	try {
		const talks = await listDharmaTalks(fetch, page);
		// A page past the end comes back empty: send the visitor to the last real page.
		if (page > 1 && talks.items.length === 0 && talks.total_pages > 0) {
			redirect(307, canonical(talks.total_pages));
		}
		return { talks };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		// Backend down: render an inline message instead of an error page.
		return { talks: null };
	}
};
