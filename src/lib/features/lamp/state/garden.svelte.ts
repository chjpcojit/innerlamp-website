import type { GardenLamp, LampGardenPage, LampTypeCode } from '$lib/types/lamp';

type Fetch = typeof globalThis.fetch;

const EMPTY_COUNTS: Record<LampTypeCode, number> = {
	OIL_LAMP: 0,
	LOTUS_CANDLE: 0,
	FLOWER_LANTERN: 0
};

/**
 * The garden list on the page: filter, items, cursor and the latest total / counts. Filter and
 * "load more" go through the website's own `GET /api/lamps`, so the token stays in the cookie.
 * / Danh sách vườn đèn trên trang: bộ lọc, các đèn, cursor và tổng / số đếm mới nhất. Lọc và
 * "xem thêm" gọi `GET /api/lamps` của website để token vẫn nằm trong cookie.
 */
export class GardenState {
	/** `null` shows every type. / `null` là tất cả các loại. */
	filter = $state<LampTypeCode | null>(null);
	items = $state<GardenLamp[]>([]);
	cursor = $state<string | null>(null);
	hasMore = $state(false);
	/** From the most recent response, whatever the filter (AC 26). / Lấy từ response gần nhất, không theo bộ lọc. */
	total = $state(0);
	counts = $state<Record<LampTypeCode, number>>({ ...EMPTY_COUNTS });
	loading = $state(false);
	failed = $state(false);

	readonly #fetch: Fetch;

	constructor(first: LampGardenPage, fetcher: Fetch = (...args) => fetch(...args)) {
		this.#fetch = fetcher;
		this.items = first.items;
		this.cursor = first.next_cursor;
		this.hasMore = first.has_more;
		this.#totals(first);
	}

	/** Whether the whole garden has no lit lamp (not just the chosen type). / Cả vườn không còn đèn nào. */
	get empty() {
		return this.total === 0;
	}

	/** Shows the first page of a type (or every type); a second press while loading is ignored. */
	async pick(filter: LampTypeCode | null) {
		if (this.loading || filter === this.filter) return;
		const page = await this.#page(filter, null);
		if (!page) return;
		this.filter = filter;
		this.items = page.items;
		this.cursor = page.next_cursor;
		this.hasMore = page.has_more;
	}

	/** Appends the next page without reordering. / Nối trang tiếp theo, giữ nguyên thứ tự. */
	async more() {
		if (this.loading || !this.hasMore || !this.cursor) return;
		const page = await this.#page(this.filter, this.cursor);
		if (!page) return;
		this.items = [...this.items, ...page.items];
		this.cursor = page.next_cursor;
		this.hasMore = page.has_more;
	}

	#totals(page: LampGardenPage) {
		this.total = page.total;
		this.counts = { ...EMPTY_COUNTS, ...page.counts };
	}

	/** One request; a failure keeps what is shown and sets `failed`. / Lỗi thì giữ danh sách và bật `failed`. */
	async #page(filter: LampTypeCode | null, cursor: string | null) {
		const query = [
			filter && `lamp_type=${encodeURIComponent(filter)}`,
			cursor && `cursor=${encodeURIComponent(cursor)}`
		].filter(Boolean);
		this.loading = true;
		this.failed = false;
		try {
			const res = await this.#fetch(`/api/lamps${query.length ? `?${query.join('&')}` : ''}`);
			if (!res.ok) throw new Error(`lamps ${res.status}`);
			const page = (await res.json()) as LampGardenPage;
			this.#totals(page);
			return page;
		} catch (e) {
			// Status only: no recipient or prayer in logs. / Chỉ log status, không log người nhận hay lời nguyện.
			console.error('[lamps] garden page failed', e instanceof Error ? e.message : 'unknown');
			this.failed = true;
			return null;
		} finally {
			this.loading = false;
		}
	}
}
