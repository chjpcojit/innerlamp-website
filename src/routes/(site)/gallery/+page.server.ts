import { redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/server/api/client';
import { listGalleryPaged } from '$lib/server/api/gallery';
import type { GalleryFilter, GalleryType } from '$lib/types/gallery';
import type { PageServerLoad } from './$types';

/** Photos per page on the website (the backend serves 20; see `listGalleryPaged`). */
const PAGE_SIZE = 12;

/** Filters offered on the page: URL value → backend `type` (the API takes one exact value). */
const TYPE_FILTERS: Record<GalleryFilter, GalleryType> = {
	temple: 'CHUA',
	statue: 'TUONG_PHAT',
	festival: 'LE_HOI',
	life: 'THIEN'
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
	const filter: GalleryFilter | null =
		rawType !== null && Object.hasOwn(TYPE_FILTERS, rawType) ? (rawType as GalleryFilter) : null;

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
		const gallery = await listGalleryPaged(
			fetch,
			{ page, type: filter ? TYPE_FILTERS[filter] : undefined },
			PAGE_SIZE
		);
		// A page past the end comes back empty: send the visitor to the last real page.
		if (page > 1 && gallery.items.length === 0 && gallery.total_pages > 0) {
			redirect(307, canonical(gallery.total_pages));
		}
		return { gallery, filter };
	} catch (e) {
		if (!(e instanceof ApiError)) throw e;
		// Backend down: render an inline message instead of an error page.
		return { gallery: null, filter };
	}
};
