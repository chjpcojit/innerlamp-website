import { redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { listSutras } from '$lib/server/api/sutras';
import type { SutraFilter, SutraListQuery } from '$lib/types/sutra';
import type { PageServerLoad } from './$types';

/**
 * Filters offered on the page: URL value → backend query. The backend has no "group" field:
 * the tabs map to `tradition`, and the chant tab to `daily=true` (kinh nhật tụng).
 */
const FILTERS: Record<SutraFilter, SutraListQuery> = {
	mahayana: { tradition: 'MAHAYANA' },
	theravada: { tradition: 'THERAVADA' },
	vajrayana: { tradition: 'VAJRAYANA' },
	daily: { daily: true }
};

/** 1-based page from `?page=`; anything that is not a positive integer counts as page 1. */
function parsePage(raw: string | null) {
	const n = Number(raw);
	return Number.isInteger(n) && n >= 1 ? n : 1;
}

export const load: PageServerLoad = async ({ url, fetch }) => {
	const rawPage = url.searchParams.get('page');
	const rawFilter = url.searchParams.get('filter');
	const page = parsePage(rawPage);
	const filter: SutraFilter | null =
		rawFilter !== null && Object.hasOwn(FILTERS, rawFilter) ? (rawFilter as SutraFilter) : null;

	/** Same path with the current (valid) filter and the given page. */
	const canonical = (p: number) => {
		const qs = new URLSearchParams();
		if (filter) qs.set('filter', filter);
		if (p > 1) qs.set('page', String(p));
		return qs.size ? `${url.pathname}?${qs}` : url.pathname;
	};

	// Keep the URL canonical: drop junk like `?page=abc`, `?page=0` or an unknown `?filter=`.
	if ((rawPage !== null && String(page) !== rawPage) || (rawFilter !== null && !filter)) {
		redirect(307, canonical(page));
	}

	try {
		const sutras = await listSutras(fetch, { ...(filter ? FILTERS[filter] : {}), page });
		// A page past the end comes back empty: send the visitor to the last real page.
		if (page > 1 && sutras.items.length === 0 && sutras.total_pages > 0) {
			redirect(307, canonical(sutras.total_pages));
		}
		return { sutras, filter };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		// Backend down: render an inline message instead of an error page.
		return { sutras: null, filter };
	}
};
