import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GardenLamp, LampGardenPage } from '$lib/types/lamp';
import { GardenState } from './garden.svelte';

const lamp = (id: number, over: Partial<GardenLamp> = {}): GardenLamp => ({
	id,
	lamp_type: 'OIL_LAMP',
	recipient: null,
	lighter_name: 'Vô danh',
	is_mine: false,
	end_at: '2026-10-30T00:00:00Z',
	...over
});

const page = (over: Partial<LampGardenPage> = {}): LampGardenPage => ({
	items: [lamp(3), lamp(2)],
	total: 5,
	counts: { OIL_LAMP: 3, LOTUS_CANDLE: 1, FLOWER_LANTERN: 1 },
	has_more: true,
	next_cursor: 'c1',
	...over
});

const ok = (body: LampGardenPage) => new Response(JSON.stringify(body), { status: 200 });

function setup(...responses: (() => Response | Promise<Response>)[]) {
	const queue = [...responses];
	const fetch = vi.fn(async (...args: [string]) => {
		void args;
		const next = queue.shift();
		if (!next) throw new Error('unexpected call');
		return next();
	});
	const garden = new GardenState(page(), fetch as unknown as typeof globalThis.fetch);
	return { fetch, garden };
}

describe('GardenState', () => {
	beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
	afterEach(() => vi.restoreAllMocks());

	it('starts from the first page, unfiltered', () => {
		const { garden } = setup();
		expect(garden.filter).toBeNull();
		expect(garden.items.map((l) => l.id)).toEqual([3, 2]);
		expect(garden.total).toBe(5);
		expect(garden.hasMore).toBe(true);
		expect(garden.empty).toBe(false);
	});

	it('is empty only when the whole garden has no lamp', () => {
		const garden = new GardenState(
			page({ items: [], total: 0, counts: { OIL_LAMP: 0, LOTUS_CANDLE: 0, FLOWER_LANTERN: 0 } })
		);
		expect(garden.empty).toBe(true);
	});

	it('a chip replaces the list, drops the cursor and refreshes total and counts', async () => {
		const { fetch, garden } = setup(() =>
			ok(
				page({
					items: [lamp(9, { lamp_type: 'LOTUS_CANDLE' })],
					total: 6,
					counts: { OIL_LAMP: 3, LOTUS_CANDLE: 2, FLOWER_LANTERN: 1 },
					has_more: false,
					next_cursor: null
				})
			)
		);
		await garden.pick('LOTUS_CANDLE');
		expect(fetch).toHaveBeenCalledWith('/api/lamps?lamp_type=LOTUS_CANDLE');
		expect(garden.filter).toBe('LOTUS_CANDLE');
		expect(garden.items.map((l) => l.id)).toEqual([9]);
		expect(garden.cursor).toBeNull();
		expect(garden.hasMore).toBe(false);
		expect(garden.total).toBe(6);
		expect(garden.counts.LOTUS_CANDLE).toBe(2);
	});

	it('an empty type shows an empty list and keeps the counts', async () => {
		const { garden } = setup(() => ok(page({ items: [], has_more: false, next_cursor: null })));
		await garden.pick('FLOWER_LANTERN');
		expect(garden.items).toEqual([]);
		expect(garden.empty).toBe(false);
		expect(garden.total).toBe(5);
	});

	it('pressing the chip already chosen makes no request', async () => {
		const { fetch, garden } = setup();
		await garden.pick(null);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('load more appends the next page with the cursor and the current filter', async () => {
		const { fetch, garden } = setup(() =>
			ok(page({ items: [lamp(1)], total: 7, has_more: false, next_cursor: null }))
		);
		await garden.more();
		expect(fetch).toHaveBeenCalledWith('/api/lamps?cursor=c1');
		expect(garden.items.map((l) => l.id)).toEqual([3, 2, 1]);
		expect(garden.hasMore).toBe(false);
		expect(garden.total).toBe(7);
	});

	it('ignores a second press while a request is running', async () => {
		let release!: (r: Response) => void;
		const { fetch, garden } = setup(() => new Promise<Response>((resolve) => (release = resolve)));
		const first = garden.more();
		await garden.more();
		await garden.pick('OIL_LAMP');
		expect(garden.loading).toBe(true);
		release(ok(page({ items: [lamp(1)], has_more: false, next_cursor: null })));
		await first;
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(garden.loading).toBe(false);
	});

	it('a failure keeps the lamps already shown and sets failed', async () => {
		const { garden } = setup(() => new Response('{}', { status: 502 }));
		await garden.pick('OIL_LAMP');
		expect(garden.failed).toBe(true);
		expect(garden.filter).toBeNull();
		expect(garden.items.map((l) => l.id)).toEqual([3, 2]);
	});

	it('a network error keeps the list too', async () => {
		const { garden } = setup(() => Promise.reject(new TypeError('offline')));
		await garden.more();
		expect(garden.failed).toBe(true);
		expect(garden.items.map((l) => l.id)).toEqual([3, 2]);
		expect(garden.cursor).toBe('c1');
	});
});
