import { redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { listDeities } from '$lib/server/api/deities';
import type { DeityFilter, DeityType } from '$lib/types/deity';
import type { PageServerLoad } from './$types';

/** Filters offered on the page: URL value → backend `type` (the API takes one exact value). */
const TYPE_FILTERS: Record<DeityFilter, DeityType> = {
	buddha: 'BUDDHA',
	bodhisattva: 'BODHISATTVA'
};

/** 1-based page from `?page=`; anything that is not a positive integer counts as page 1. */
function parsePage(raw: string | null) {
	const n = Number(raw);
	return Number.isInteger(n) && n >= 1 ? n : 1;
}

export const load: PageServerLoad = async ({ url, fetch }) => {
	const rawPage = url.searchParams.get('page');
	const rawType = url.searchParams.get('type');
	const page = parsePage(rawPage);
	const filter: DeityFilter | null =
		rawType !== null && Object.hasOwn(TYPE_FILTERS, rawType) ? (rawType as DeityFilter) : null;

	/** Same path with the current (valid) filter and the given page. */
	const canonical = (p: number) => {
		const qs = new URLSearchParams();
		if (filter) qs.set('type', filter);
		if (p > 1) qs.set('page', String(p));
		return qs.size ? `${url.pathname}?${qs}` : url.pathname;
	};

	// Keep the URL canonical: drop junk like `?page=abc`, `?page=0` or an unknown `?type=`.
	if ((rawPage !== null && String(page) !== rawPage) || (rawType !== null && !filter)) {
		redirect(307, canonical(page));
	}

	try {
		const deities = await listDeities(fetch, {
			page,
			type: filter ? TYPE_FILTERS[filter] : undefined
		});
		// A page past the end comes back empty: send the visitor to the last real page.
		if (page > 1 && deities.items.length === 0 && deities.total_pages > 0) {
			redirect(307, canonical(deities.total_pages));
		}
		return { deities, filter };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		// Backend down: render an inline message instead of an error page.
		return { deities: null, filter };
	}
};
