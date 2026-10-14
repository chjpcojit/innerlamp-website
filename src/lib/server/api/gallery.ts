import { apiCall } from './client';
import type {
	GalleryImageDetail,
	GalleryListQuery,
	GalleryPage,
	GalleryTop
} from '$lib/types/gallery';

type Fetch = typeof globalThis.fetch;

/** The 10 featured gallery images, mixed across the four types. Public. */
export const getTopGallery = (fetch: Fetch) => apiCall<GalleryTop>(fetch, '/v1/gallery/top');

/**
 * Paginated list (20 per page) in a fixed order; no search or sort. A page past the end
 * returns empty `items` (total kept). Throws `ApiError` `INVALID_PAGE`
 * (`details.field = "page"`) for page < 1 or non-numeric, and `INVALID_GALLERY_TYPE`
 * (`details.field = "type"`) for anything but an exact `CHUA` / `TUONG_PHAT` / `THIEN` /
 * `LE_HOI` (one value only, case-sensitive).
 */
export const listGallery = (fetch: Fetch, { page, type }: GalleryListQuery = {}) => {
	const params = new URLSearchParams();
	if (page !== undefined) params.set('page', String(page));
	if (type) params.set('type', type);
	const qs = params.size ? `?${params}` : '';
	return apiCall<GalleryPage>(fetch, `/v1/gallery${qs}`);
};

/**
 * One image by `id`, with `author` / `license` / `source_url`. Throws `ApiError` with
 * status 404 / `GALLERY_IMAGE_NOT_FOUND` when unknown.
 */
export const getGalleryImage = (fetch: Fetch, id: string) =>
	apiCall<GalleryImageDetail>(fetch, `/v1/gallery/${encodeURIComponent(id)}`);

/**
 * Same as `listGallery` but with the website's own page size. The backend page size is
 * fixed (20) and has no `limit` param, so the requested window is cut out of one or two
 * backend pages. `page_size` and `total_pages` in the result follow `pageSize`.
 */
export async function listGalleryPaged(
	fetch: Fetch,
	{ page = 1, type }: GalleryListQuery,
	pageSize: number
): Promise<GalleryPage> {
	const start = (page - 1) * pageSize;
	// Backend page that holds `start`; assume 20 and redo once if the response says otherwise.
	let backendSize = 20;
	let backendPage = Math.floor(start / backendSize) + 1;
	let first = await listGallery(fetch, { page: backendPage, type });
	if (first.page_size !== backendSize) {
		backendSize = first.page_size;
		const corrected = Math.floor(start / backendSize) + 1;
		if (corrected !== backendPage) {
			backendPage = corrected;
			first = await listGallery(fetch, { page: backendPage, type });
		}
	}

	const offset = start - (backendPage - 1) * backendSize;
	const items = first.items.slice(offset, offset + pageSize);
	// The window straddles two backend pages.
	if (items.length < pageSize && backendPage < first.total_pages) {
		const next = await listGallery(fetch, { page: backendPage + 1, type });
		items.push(...next.items.slice(0, pageSize - items.length));
	}

	return {
		items,
		page,
		page_size: pageSize,
		total: first.total,
		total_pages: Math.ceil(first.total / pageSize)
	};
}
