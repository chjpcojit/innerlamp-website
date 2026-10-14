/** DTOs for the backend gallery API (`/v1/gallery/*`): the "beautiful temple photos" library. */

/**
 * Open enum: the backend may add values, so decode as string and tolerate unknown ones.
 * `CHUA` is the temple photos; the others are Buddha statues, meditation and festivals.
 */
export type GalleryType = 'CHUA' | 'TUONG_PHAT' | 'THIEN' | 'LE_HOI' | (string & {});

/** Type filter as it appears in the website URL (`?type=`); mapped to a `GalleryType` server-side. */
export type GalleryFilter = 'temple' | 'statue' | 'festival' | 'life';

/** Shared by `top` and the list; the first part of `GalleryImageDetail`. */
export interface GalleryImageSummary {
	/** Stable key, e.g. `gallery_001`. */
	id: string;
	type: GalleryType;
	title: string;
	/** Free-form place name (e.g. "Hà Nội, Việt Nam"); not linked to a temple `id`. */
	location: string;
	/** Small JPEG. Absolute URL built from the backend host: use as returned. */
	thumbnail_url: string;
	/** Full-size JPEG. Absolute URL built from the backend host: use as returned. */
	image_url: string;
}

/** CC BY / CC BY-SA images require showing `author` + `license` wherever the image is shown. */
export interface GalleryImageDetail extends GalleryImageSummary {
	author: string;
	license: string;
	source_url: string;
}

export interface GalleryTop {
	/** Up to 10 featured images, mixed across the four types in rotation. */
	items: GalleryImageSummary[];
}

export interface GalleryPage {
	items: GalleryImageSummary[];
	page: number;
	/** Fixed by the backend (20); do not hard-code. */
	page_size: number;
	total: number;
	total_pages: number;
}

export interface GalleryListQuery {
	/** 1-based; defaults to 1. */
	page?: number;
	/** One exact, upper-case value; omit for all types. `total` / `total_pages` follow the filter. */
	type?: GalleryType;
}
